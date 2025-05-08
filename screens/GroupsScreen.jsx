import React, { useCallback, useState, useContext } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import GroupItem from "../components/GroupItem";
import { useFocusEffect } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import styles from "../styles/GroupScreenStyles";
import { ApiClient } from "../api/ApiClient";

const GroupsScreen = () => {
  const { id } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener los grupos
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true); // Mostrar el loading mientras se obtienen los datos
      const response = await ApiClient(`groups/api/v1/groups/user/${id}`);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setGroups(data);
      } else {
        setGroups([]); // Si hay un error en la respuesta, establecer grupos como vacío
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [id]); // Dependencia: id del usuario

  // Usar useFocusEffect para ejecutar fetchGroups cuando la pantalla esté en foco
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups]) // Dependencia: fetchGroups
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Grupos</Text>
      {loading && <ActivityIndicator size="large" color="#276b80" />}
      {!loading && groups.length === 0 && (
        <Text style={styles.alertMessage}>No tienes grupos asignados.</Text>
      )}
      {!loading && groups.length > 0 && (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <GroupItem group={item} />}
        />
      )}
    </View>
  );
};

export default GroupsScreen;
