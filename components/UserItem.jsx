import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/UserItemStyles"; 

const UserItem = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{user.userFullName}</Text>
      <Text style={styles.userEmail}>{user.userEmail}</Text>
    </View>
  );
};

export default UserItem;
