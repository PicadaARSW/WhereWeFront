import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ecc6ea", 
      },
      backgroundImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },
      mainTitle: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#003366",
        marginBottom: 20,
        textAlign: "center",
      },
      welcomeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#003366"
      },
      card: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      },
      signInButton: {
        backgroundColor: "#003366",
      },
      buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      },
      paragraphText: {
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        color: "#003366",
        marginBottom: 10,
      },
      
    });
