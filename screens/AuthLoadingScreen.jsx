import React from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
  Image,
  Animated,
} from "react-native";
import styles from "../styles/AuthLoadingScreenStyles";

const AuthLoadingScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container} testID="auth-loading-screen">
      <View style={styles.header} testID="header-container">
        <Text style={styles.headerText}>Where We!</Text>
      </View>
      <Animated.View
        style={[styles.loadingContainer, { opacity: fadeAnim }]}
        testID="animated-container"
      >
        <Image
          source={require("../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
          testID="app-logo"
        />
        <ActivityIndicator
          color={Platform.OS === "android" ? "#276b80" : "#fff"}
          size="large"
          style={styles.indicator}
          testID="loading-indicator"
        />
        <Text style={styles.statusText}>Iniciando sesión...</Text>
      </Animated.View>
    </View>
  );
};

export default AuthLoadingScreen;
