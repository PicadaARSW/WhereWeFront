import React, { useContext } from "react";
import { Alert, View, Image } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { AuthContext } from "../AuthContext";
import styles from "../styles/SigninScreenStyles";
import { UserContext } from "../UserContext";
import { GraphManager } from "../graph/GraphManager";

const SignInScreen = (props) => {
  const { signIn } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);

  const _signInAsync = async () => {
    try {
      // Iniciar sesión usando el contexto AuthContext
      await signIn();

      // Obtener los datos del usuario
      const user = await GraphManager.getUserAsync();
      if (!user) {
        throw new Error("No se pudo obtener la información del usuario.");
      }

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
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      Alert.alert(
        "Error de Inicio de Sesión",
        error.message ||
          "Ocurrió un error inesperado. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/WhereWeImg.jpg")}
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
              Iniciar Sesión
            </Button>
          </View>
        </Card.Actions>
      </Card>
    </View>
  );
};

export default SignInScreen;
