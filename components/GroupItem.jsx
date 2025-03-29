import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

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

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonMap: {
    paddingVertical: 5,
    marginTop: 5,
    borderRadius: 15,
    backgroundColor: "#276B80",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default GroupItem;
