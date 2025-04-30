import React, { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import UserItem from "../components/UserItem";
import { Button, IconButton } from "react-native-paper";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/GroupDetailScreenStyles";
import PropTypes from "prop-types";
import { ApiClient } from "../api/ApiClient";
import { UserContext } from "../UserContext";
import CustomAlert from "../components/CustomAlert";

const GroupDetailScreenContent = ({ route }) => {
  const navigation = useNavigation();
  const { groupId } = route.params;
  const { id } = useContext(UserContext);
  const [groupDetails, setGroupDetails] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [timeUntilCodeUpdate, setTimeUntilCodeUpdate] = useState({
    hours: null,
    minutes: null,
  });

  // Obtener detalles del grupo
  const fetchGroupDetails = async () => {
    try {
      const groupResponse = await ApiClient(`:8085/api/v1/groups/${groupId}`);
      const groupData = await groupResponse.json();
      setGroupDetails(groupData);
      updateTimeUntilCodeUpdate(groupData.nextCodeUpdate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  // Actualizar el tiempo restante cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      if (groupDetails?.nextCodeUpdate) {
        updateTimeUntilCodeUpdate(groupDetails.nextCodeUpdate);
      }
    }, 300000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, [groupDetails]);

  // Calcular tiempo restante hasta la próxima actualización
  const updateTimeUntilCodeUpdate = (nextCodeUpdate) => {
    const now = new Date();
    const nextUpdate = new Date(nextCodeUpdate);
    const diffMs = nextUpdate - now;

    if (diffMs <= 0) {
      setTimeUntilCodeUpdate({ hours: 0, minutes: 0 });
    } else {
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      if (hoursLeft > 0) {
        setTimeUntilCodeUpdate({ hours: hoursLeft, minutes: null });
      } else {
        const minutesLeft = Math.max(Math.ceil(diffMs / (1000 * 60)), 0);
        setTimeUntilCodeUpdate({ hours: 0, minutes: minutesLeft });
      }
    }
  };

  // Obtener detalles de los miembros
  useEffect(() => {
    const fetchMembersDetails = async () => {
      if (groupDetails?.members) {
        try {
          const memberPromises = groupDetails.members.map(async (memberId) => {
            const userResponse = await ApiClient(
              `:8084/api/v1/users/${memberId}`
            );
            const userData = await userResponse.json();
            return userData;
          });

          const members = await Promise.all(memberPromises);
          setMembersDetails(members);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingMembers(false);
        }
      }
    };

    fetchMembersDetails();
  }, [groupDetails]);

  // Obtener detalles del admin
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (groupDetails) {
        try {
          const adminResponse = await ApiClient(
            `:8084/api/v1/users/${groupDetails.admin}`
          );
          const adminData = await adminResponse.json();
          setAdminName(adminData.userFullName);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchAdminDetails();
  }, [groupDetails]);

  // Solicitar permisos de geolocalización
  const requestLocationPermission = async () => {
    // Request foreground permissions first
    let { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      console.error("Foreground location permission denied");
      return false;
    }

    // Request background permissions (required for Android API 29+ and iOS)
    let { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      console.error("Background location permission denied");
      return false;
    }

    return true;
  };
  useEffect(() => {
    requestLocationPermission(); // Solicitar permiso al cargar el componente
  }, []);

  // Manejar salida del grupo
  const handleLeaveGroup = async () => {
    try {
      const response = await ApiClient(
        `:8085/api/v1/groups/leave/${groupId}/${id}`,
        "DELETE"
      );
      if (response.ok) {
        navigation.goBack();
      } else {
        console.error("Failed to leave group");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const confirmLeave = () => {
    setShowLeaveAlert(true);
  };

  // Manejar expulsión de miembro
  const handleExpelMember = (expelledUserId) => {
    setMembersDetails(
      membersDetails.filter((member) => member.id !== expelledUserId)
    );
    fetchGroupDetails(); // Refrescar detalles del grupo
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#276b80" />
        ) : (
          <View style={styles.groupInfo}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Detalles del Grupo</Text>
              <IconButton
                icon="logout"
                iconColor="#f2f0eb"
                color="#fff"
                size={24}
                onPress={confirmLeave}
                style={styles.leaveButton}
                accessibilityLabel="Salir del grupo"
              />
            </View>
            {groupDetails && (
              <>
                <View style={styles.groupDetail}>
                  <Text style={styles.detailText}>Nombre del Grupo:</Text>
                  <Text style={styles.groupName}>{groupDetails.nameGroup}</Text>
                </View>
                <View style={styles.groupDetail}>
                  <Text style={styles.detailText}>Código del Grupo:</Text>
                  <Text style={styles.groupName}>{groupDetails.code}</Text>
                </View>
                <View style={styles.groupDetail}>
                  <Text style={styles.detailText}>
                    Tiempo para nuevo código:
                  </Text>
                  <Text style={styles.groupName}>
                    {(() => {
                      let timeText = "Calculando...";
                      if (timeUntilCodeUpdate.hours !== null) {
                        if (timeUntilCodeUpdate.hours > 0) {
                          timeText = `${timeUntilCodeUpdate.hours} horas`;
                        } else if (timeUntilCodeUpdate.minutes !== null) {
                          timeText = `${timeUntilCodeUpdate.minutes} minutos`;
                        }
                      }
                      return timeText;
                    })()}
                  </Text>
                </View>
                <View style={styles.groupDetail}>
                  <Text style={styles.detailText}>Admin:</Text>
                  <Text style={styles.adminText}>{adminName}</Text>
                </View>

                <Text style={styles.membersHeader}>Miembros:</Text>
                {loadingMembers ? (
                  <ActivityIndicator size="small" color="#276b80" />
                ) : (
                  membersDetails.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      isAdmin={groupDetails.admin === id}
                      groupId={groupId}
                      onExpel={handleExpelMember}
                    />
                  ))
                )}
                <Button
                  mode="contained"
                  style={styles.buttonMap}
                  onPress={() =>
                    navigation.navigate("GroupMapScreen", { groupId: groupId })
                  }
                >
                  <Text style={styles.buttonText}>Ver mapa</Text>
                </Button>
              </>
            )}
          </View>
        )}
      </ScrollView>
      <CustomAlert
        visible={showLeaveAlert}
        title="Confirmar salida"
        message="¿Estás seguro de que quieres salir de este grupo?"
        buttons={[
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setShowLeaveAlert(false),
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: handleLeaveGroup,
          },
        ]}
        onClose={() => setShowLeaveAlert(false)}
      />
    </>
  );
};

GroupDetailScreenContent.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      groupId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GroupDetailScreenContent;
