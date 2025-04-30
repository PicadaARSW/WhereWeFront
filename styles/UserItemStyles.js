import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  userTimeZone: {
    fontSize: 12,
    color: "gray",
  },
  expelButton: {
    backgroundColor: "#d32f2f",
    marginLeft: 10,
  },
});
