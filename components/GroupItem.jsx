import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/GroupItemStyles"; 
const GroupItem = ({ group }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{group.nameGroup}</Text>
      <TouchableOpacity
        style={styles.buttonMap}
        onPress={() =>
          navigation.navigate("GroupDetailScreen", { groupId: group.id })
        }
      >
        <Text style={styles.buttonText}>Ver Grupo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroupItem;
