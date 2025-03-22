import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import UserItem from "../components/UserItem";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native"; // Importar useNavigation

const GroupDetailScreen = ({ route }) => {
  const navigation = useNavigation(); // Usar el hook useNavigation
  const { groupId } = route.params;
  const [groupDetails, setGroupDetails] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [socket, setSocket] = useState(null);
  const [locations, setLocations] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Obtener detalles del grupo
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await fetch(
          `http://192.168.1.21:8085/api/v1/groups/${groupId}`
        );
        const groupData = await groupResponse.json();
        setGroupDetails(groupData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // Obtener detalles de los miembros
  useEffect(() => {
    const fetchMembersDetails = async () => {
      if (groupDetails && groupDetails.members) {
        try {
          const memberPromises = groupDetails.members.map(async (memberId) => {
            const userResponse = await fetch(
              `http://192.168.1.21:8084/api/v1/users/${memberId}`
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
            `http://192.168.1.21:8084/api/v1/users/${groupDetails.admin}`
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
              />
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  groupInfo: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#276b80",
    marginBottom: 15,
  },
  groupDetail: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#276b80",
    marginTop: 5,
  },
  adminText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  membersHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#276b80",
    marginTop: 20,
    marginBottom: 10,
  },
  buttonMap: {
    color: "white",
    backgroundColor: "#276b80",
  },
});

export default GroupDetailScreen;
