import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
    alignItems: "center",
    paddingTop: 20,
  },
  infoContainer: {
    height: height * 0.4, 
    width: "90%",
    backgroundColor: "#F8D9D6", 
    padding: 20,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-evenly",
    elevation: 5,
  },
  userIcon: {
    fontSize: 50, 
    color: "#276b80",
  },
  userText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#276b80",
  },
  email: {
    color: "#6c757d",
    fontSize: 16,
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 10,
  },
  joinGroup: {
    backgroundColor: "#2ab4ab", 
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  createContainer: {
    height: height * 0.4, 
    width: "90%",
    backgroundColor: "#F8D9D6",
    padding: 20,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-evenly",
    elevation: 5,
  },
  groupIcon: {
    fontSize: 50,
    color: "#276b80",
  },
  createButton: {
    backgroundColor: "#2ab4ab", 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
    flexDirection: "row",
    justifyContent: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
