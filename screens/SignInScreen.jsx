// Adapted from https://reactnavigation.org/docs/auth-flow
import React from "react";
import { Alert, Button, StyleSheet, View } from "react-native";
import { AuthContext } from "../AuthContext";

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
      title: "Please sign in",
      headerShown: true,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Button title="Sign In" onPress={this._signInAsync} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
