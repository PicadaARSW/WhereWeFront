import { StyleSheet } from "react-native";

export default StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    alertContainer: {
      backgroundColor: "white",
      width: "80%",
      borderRadius: 15,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#276b80",
      marginBottom: 10,
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      color: "#555",
      marginBottom: 20,
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 8,
      backgroundColor: "#276b80",
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    destructiveButton: {
      backgroundColor: "#FF6347",
    },
    destructiveButtonText: {
      color: "white",
    },
    cancelButton: {
      backgroundColor: "#ccc",
    },
    cancelButtonText: {
      color: "#333",
    },
  });