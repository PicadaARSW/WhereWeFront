import React, { useContext } from "react";
import { Alert, View, Image } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { AuthContext } from "../AuthContext";
import styles from "../styles/SigninScreenStyles";
import { UserContext } from "../UserContext"; // Importa el UserContext
import { GraphManager } from "../graph/GraphManager";

const SignInScreen = (props) => {
  const { signIn } = useContext(AuthContext); // Usa el contexto para el inicio de sesión
  const { setUser } = useContext(UserContext); // Usa el setUser del UserContext

  const _signInAsync = async () => {
    try {
      // Iniciar sesión usando el AuthManager
      await signIn();

      const user = await GraphManager.getUserAsync(); // Asegúrate de obtener los detalles del usuario de GraphManager

      // Actualizar el contexto con la información del usuario
      setUser({
        userLoading: false,
        id: user.id,
        userFirstName: user.userFirstName,
        userFullName: user.userFullName,
        userEmail: user.userEmail,
        userTimeZone: user.userTimeZone,
        userPhoto: user.userPhoto || require("../images/no-profile-pic.png"),
      });

      // Enviar la información del usuario al servicio de backend
      const userPayload = {
        id: user.id,
        userFirstName: user.userFirstName,
        userFullName: user.userFullName,
        userEmail: user.userEmail,
        userTimeZone: user.userTimeZone,
      };

      console.log("Usuario:", userPayload);
      // Realiza la llamada POST al backend para guardar el usuario
      try {
        const response = await fetch("http://192.168.1.21:8084/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }

        const responseData = await response.json(); // Espera y convierte la respuesta en JSON
        console.log("Usuario guardado con éxito", responseData); // Muestra la respuesta de éxito
      } catch (error) {
        console.error("Error en ApiClient:", error); // Error en la solicitud
        Alert.alert("Error en la petición", error.message);
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      Alert.alert("Sign In Error", JSON.stringify(error));
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/background.jpg")}
        style={styles.backgroundImage}
      />
      <Title style={styles.mainTitle}>Where We!</Title>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.welcomeTitle}>Bienvenido</Title>
          <Paragraph style={styles.paragraphText}>
            Inicio de Sesión en WhereWe!
          </Paragraph>
        </Card.Content>
        <Card.Actions style={styles.buttonContainer}>
          <View style={{ width: "100%", alignItems: "center" }}>
            <Button
              mode="contained"
              style={styles.signInButton}
              onPress={_signInAsync}
            >
              Login
            </Button>
          </View>
        </Card.Actions>
      </Card>
    </View>
  );
};

export default SignInScreen;
