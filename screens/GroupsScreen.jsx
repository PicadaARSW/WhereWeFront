import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import GroupItem from "../components/GroupItem";
import { UserContext } from "../UserContext";
import styles from "../styles/GroupScreenStyles"; 

const GroupsScreen = () => {
  const { id: id } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.7:8085/api/v1/groups/user/${id}`
        );
        console.log(`http://192.168.1.7:8085/api/v1/groups/user/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setGroups(data);
        } else {
          alert("No tiene grupos aún");
        }
      } catch (error) {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [id]);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Grupos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#276b80" />
      ) : groups.length === 0 ? (
        <Text>No tienes grupos asignados.</Text>
      ) : (
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
