import React from "react";
import { View, Text, StyleSheet } from "react-native";

const UserItem = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{user.userFullName}</Text>
      <Text style={styles.userEmail}>{user.userEmail}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "gray",
  },
  userTimeZone: {
    fontSize: 12,
    color: "gray",
  },
});

export default UserItem;
