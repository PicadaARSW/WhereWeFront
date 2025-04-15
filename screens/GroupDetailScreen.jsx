import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import UserItem from "../components/UserItem";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/GroupDetailScreenStyles";

const GroupDetailScreenContent = ({ route }) => {
  const navigation = useNavigation();
  const { groupId } = route.params;
  const [groupDetails, setGroupDetails] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [timeUntilCodeUpdate, setTimeUntilCodeUpdate] = useState({
    hours: null,
    minutes: null,
  });

  // Obtener detalles del grupo
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await fetch(
          `http://192.168.1.7:8085/api/v1/groups/${groupId}`
        );
        const groupData = await groupResponse.json();
        setGroupDetails(groupData);
        updateTimeUntilCodeUpdate(groupData.nextCodeUpdate);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // Actualizar el tiempo restante cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      if (groupDetails && groupDetails.nextCodeUpdate) {
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
      if (groupDetails && groupDetails.members) {
        try {
          const memberPromises = groupDetails.members.map(async (memberId) => {
            const userResponse = await fetch(
              `http://192.168.1.7:8084/api/v1/users/${memberId}`
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
          const adminResponse = await fetch(
            `http://192.168.1.7:8084/api/v1/users/${groupDetails.admin}`
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
  };

  useEffect(() => {
    requestLocationPermission(); // Solicitar permiso al cargar el componente
  }, []);

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#276b80" />
      ) : (
        <View style={styles.groupInfo}>
          <Text style={styles.header}>Detalles del Grupo</Text>
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
                <Text style={styles.detailText}>Tiempo para nuevo código:</Text>
                <Text style={styles.groupName}>
                  {timeUntilCodeUpdate.hours !== null
                    ? timeUntilCodeUpdate.hours > 0
                      ? `${timeUntilCodeUpdate.hours} horas`
                      : timeUntilCodeUpdate.minutes !== null
                      ? `${timeUntilCodeUpdate.minutes} minutos`
                      : "Calculando..."
                    : "Calculando..."}
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
                  <UserItem key={user.id} user={user} />
                ))
              )}
              <Button
                style={styles.buttonMap}
                title="Empezar a ver mapa"
                onPress={() =>
                  navigation.navigate("GroupMapScreen", { groupId: groupId })
                }
              >
                {" "}
                <Text style={styles.buttonText}>Ver mapa</Text>{" "}
              </Button>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default GroupDetailScreenContent;
