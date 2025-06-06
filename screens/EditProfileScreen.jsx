import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity } from "react-native";
import { AuthContext } from "../AuthContext";
import { UserContext } from "../UserContext";
import styles from "../styles/EditProfileScreenStyles";
import CustomAlert from "../components/CustomAlert";
import { ApiClient } from "../api/ApiClient";

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
              await ApiClient(
                `groups/api/v1/groups/leave-all/${userContext.id}`,
                "DELETE"
              );
              // Call API to delete user account
              await ApiClient(
                `users/api/v1/users/delete/${userContext.id}`,
                "DELETE"
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
    <View style={styles.container} testID="edit-profile-screen">
      <Text style={styles.title} testID="profile-title">
        Editar Perfil
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleEditProfilePicture}
        testID="edit-picture-button"
      >
        <Text style={styles.buttonText}>Editar Foto de Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
        testID="delete-account-button"
      >
        <Text style={styles.buttonText}>Eliminar Cuenta</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
        testID="custom-alert-component"
      />
    </View>
  );
};
EditProfileScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default EditProfileScreen;
