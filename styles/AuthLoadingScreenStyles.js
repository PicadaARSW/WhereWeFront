import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7", // Fondo claro y moderno
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#276b80", // Fondo del encabezado consistente con otras pantallas
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo blanco semi-transparente
    borderRadius: 20,
    margin: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 310,
    height: 310,
    marginBottom: 20,
  },
  indicator: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#276b80", // Color principal para el texto
    textAlign: "center",
  },
});
