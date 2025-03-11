import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UserContext } from "../UserContext";
import { GraphManager } from "../graph/GraphManager";

const HomeComponent = () => {
  const userContext = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const fetchedUser = await GraphManager.getUserAsync();
      if (fetchedUser) {
        setUser(fetchedUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          color={Platform.OS === "android" ? "#276b80" : undefined}
          size="large"
        />
      ) : (
        <>
          <Text style={styles.text}>
            Hola {user?.userFirstName || "Usuario"}!
          </Text>
          <Text style={styles.text}>
            Correo: {user?.userEmail || "No disponible"}
          </Text>
        </>
      )}
    </View>
  );
};

export default function HomeScreen() {
  return <HomeComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
