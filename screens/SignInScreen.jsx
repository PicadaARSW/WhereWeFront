// Adapted from https://reactnavigation.org/docs/auth-flow
import React from "react";
import { Alert, View,Image } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { AuthContext } from "../AuthContext";
import styles from "../styles/SigninScreenStyles";

export default class SignInScreen extends React.Component {
  static contextType = AuthContext;

  _signInAsync = async () => {
    try {
      await this.context.signIn();
    } catch (error) {
      console.error("Error during sign-in:", error);
      Alert.alert("Sign In Error", JSON.stringify(error));
    }
  };

  componentDidMount() {
    this.props.navigation.setOptions({
      title: "Registro de usuario",
      headerShown: true,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={require("../assets/background.jpg")} style={styles.backgroundImage} />
        <Title style={styles.mainTitle}>Where We!📍</Title>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>Bienvenido</Title>
            <Paragraph style={styles.paragraphText}>Registrate en WhereWe!</Paragraph>
          </Card.Content>
          <Card.Actions style={styles.buttonContainer}>
            <View style={{ width: "100%", alignItems: "center" }}>
            <Button mode="contained" style={styles.signInButton} onPress={this._signInAsync}>
              Sign In
            </Button>
            </View>
          </Card.Actions>
        </Card>
      </View>
    );
  }
}