import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AuthContext } from "../AuthContext";
import { UserContext } from "../UserContext";
import styles from "../styles/EditProfileScreenStyles";
import CustomAlert from "../components/CustomAlert";

const EditProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const userContext = useContext(UserContext);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [],
  });

  const showCustomAlert = (title, message, buttons) => {
    setAlertVisible(false);
    setTimeout(() => {
      setAlertConfig({ title, message, buttons });
      setAlertVisible(true);
    }, 100);
  };

  const handleDeleteAccount = () => {
    showCustomAlert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Call API to leave all groups
              await fetch(
                `http://192.168.101.4:8085/api/v1/groups/leave-all/${userContext.id}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                }
              );
              // Call API to delete user account
              await fetch(
                `http://192.168.101.4:8084/api/v1/users/delete/${userContext.id}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                }
              );
              // Sign out and redirect to login
              signOut();
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "No se pudo eliminar la cuenta. Intenta de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const handleEditProfilePicture = () => {
    navigation.navigate("ProfilePictureSettings");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleEditProfilePicture}
      >
        <Text style={styles.buttonText}>Editar Foto de Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Eliminar Cuenta</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default EditProfileScreen;
