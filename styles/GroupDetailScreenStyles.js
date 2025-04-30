import { StyleSheet } from "react-native";

export default StyleSheet.create({
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#276b80",
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
  buttonMap: {
    paddingVertical: 5,
    marginTop: 20,
    backgroundColor: "#276B80",
  },
  leaveButton: {
    backgroundColor: "#d32f2f",
    marginTop: 20,
    marginBottom: 10,
  },
  leaveButtonText: {
    color: "#fff",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
