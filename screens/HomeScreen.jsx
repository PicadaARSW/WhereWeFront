import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ActivityIndicator,Platform,Text,View,TouchableOpacity,} from "react-native";
import { UserContext } from "../UserContext";
import { GraphManager } from "../graph/GraphManager";
import styles from "../styles/HomeScreenStyles";

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
        {/* Información - Unirse a un grupo */}
        <View style={styles.infoContainer}>
          <Icon name="account-circle" style={styles.userIcon} />
          <Text style={styles.userText}>Hola, {user?.userFirstName || "Usuario"}!</Text>
          <Text style={styles.email}>{user?.userEmail || "No disponible"}</Text>
          <View style={styles.separator} />
          <Text style={styles.description}>
            Encuentra y únete a grupos para compartir tu ubicación en tiempo real.
          </Text>
          <TouchableOpacity style={styles.joinGroup}>
            <Text style={styles.buttonText}>Únete a un grupo</Text>
          </TouchableOpacity>
        </View>

        {/* Crear un grupo */}
        <View style={styles.createContainer}>
          <Icon name="account-group" style={styles.groupIcon} />
          <Text style={styles.userText}>Crea un grupo</Text>
          <View style={styles.separator} />
          <Text style={styles.description}>
            Comparte tu ubicación con amigos o familiares creando un grupo privado.
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Crea un grupo</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
);
};

export default function HomeScreen() {
  return <HomeComponent />;
}
