import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const GroupItem = ({ group }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{group.nameGroup}</Text>
      <Button
        title="Ver Grupo"
        onPress={() =>
          navigation.navigate("GroupDetailScreen", { groupId: group.id })
        }
      />
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
});

export default GroupItem;
