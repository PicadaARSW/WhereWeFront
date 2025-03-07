import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Temporary placeholder view
const CalendarComponent = () => (
  <View style={styles.container}>
    <Text>Calendar</Text>
  </View>
);

export default function CalendarScreen() {
  return <CalendarComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
