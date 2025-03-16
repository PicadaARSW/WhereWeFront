import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import UserItem from "../components/UserItem";

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [groupDetails, setGroupDetails] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true); // Estado adicional para el loading de los miembros

  // useEffect para obtener los detalles del grupo
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await fetch(
          `http://192.168.50.218:8085/api/v1/groups/${groupId}`
        );
        const groupData = await groupResponse.json();
        setGroupDetails(groupData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Dejamos de mostrar el loading una vez obtenemos los detalles del grupo
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // useEffect para obtener los detalles de los miembros
  useEffect(() => {
    const fetchMembersDetails = async () => {
      if (groupDetails && groupDetails.members) {
        try {
          const memberPromises = groupDetails.members.map(async (memberId) => {
            const userResponse = await fetch(
              `http://192.168.50.218:8084/api/v1/users/${memberId}`
            );
            const userData = await userResponse.json();
            return userData;
          });

          const members = await Promise.all(memberPromises);
          setMembersDetails(members);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingMembers(false); // Dejamos de mostrar el loading una vez obtenemos los detalles de los miembros
        }
      }
    };

    fetchMembersDetails();
  }, [groupDetails]); // Dependemos de groupDetails para hacer la consulta de los miembros

  // useEffect para obtener los detalles del admin
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (groupDetails) {
        try {
          const adminResponse = await fetch(
            `http://192.168.50.218:8084/api/v1/users/${groupDetails.admin}`
          );
          const adminData = await adminResponse.json();

          setAdminName(adminData.userFullName);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchAdminDetails();
  }, [groupDetails]); // Dependemos de groupDetails para hacer la consulta de los miembros

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
});

export default GroupDetailScreen;
