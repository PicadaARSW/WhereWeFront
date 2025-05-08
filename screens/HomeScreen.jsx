import React, { useContext, useEffect, useState, useRef } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import PropTypes from "prop-types";
import { UserContext } from "../UserContext";
import { GraphManager } from "../graph/GraphManager";
import { ApiClient } from "../api/ApiClient";
import styles from "../styles/HomeScreenStyles";

// Custom Alert Component with Animated Entrance
const CustomAlert = ({
  visible,
  type = "default",
  title,
  message,
  onClose,
  autoDismiss = 3000,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const animatedValue = useRef(new Animated.Value(screenWidth)).current;
  const timerRef = useRef(null);

  // Animate the alert sliding in from the right
  useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        handleClose();
      }, autoDismiss);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, autoDismiss]);

  // Close animation
  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });

    // Limpiar temporizador al cerrar manualmente
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    CustomAlert.propTypes = {
      visible: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(["default", "success", "error", "warning"]),
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      onClose: PropTypes.func.isRequired,
      autoDismiss: PropTypes.number, // Added prop validation for autoDismiss
    };
  };

  // Alert configurations
  const alertConfigs = {
    default: {
      backgroundColor: "#f0f0f0",
      titleColor: "#333",
      messageColor: "#666",
      iconName: "information-outline",
      iconColor: "#3498db",
    },
    success: {
      backgroundColor: "#e8f5e9",
      titleColor: "#2e7d32",
      messageColor: "#388e3c",
      iconName: "check-circle-outline",
      iconColor: "#2e7d32",
    },
    error: {
      backgroundColor: "#ffebee",
      titleColor: "#d32f2f",
      messageColor: "#f44336",
      iconName: "alert-circle-outline",
      iconColor: "#d32f2f",
    },
    warning: {
      backgroundColor: "#fff3e0",
      titleColor: "#f57c00",
      messageColor: "#ff9800",
      iconName: "alert-outline",
      iconColor: "#f57c00",
    },
  };

  const config = alertConfigs[type] || alertConfigs.default;

  return visible ? (
    <Animated.View
      style={[
        alertStyles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateX: animatedValue }],
        },
      ]}
    >
      <View style={alertStyles.contentContainer}>
        <Icon
          name={config.iconName}
          size={40}
          color={config.iconColor}
          style={alertStyles.icon}
        />
        <View style={alertStyles.textContainer}>
          <Text style={[alertStyles.titleText, { color: config.titleColor }]}>
            {title}
          </Text>
          <Text
            style={[alertStyles.messageText, { color: config.messageColor }]}
          >
            {message}
          </Text>
        </View>
        <TouchableOpacity style={alertStyles.closeButton} onPress={handleClose}>
          <Icon name="close" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  ) : null;
};

// Alert Styles
const alertStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 10,
  },
});

const HomeComponent = () => {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [nameGroup, setNameGroup] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Estado para el modal de unirse a un grupo
  const [groupCode, setGroupCode] = useState("");
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);

  // State for custom alert
  const [alert, setAlert] = useState({
    visible: false,
    type: "default",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const fetchedUser = await GraphManager.getUserAsync();
      if (fetchedUser) {
        userContext.setUser(fetchedUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  /** Función para crear un grupo */
  const handleCreateGroup = async () => {
    if (!nameGroup) {
      setAlert({
        visible: true,
        type: "warning",
        title: "Campos Incompletos",
        message: "Por favor, ingrese un nombre para el grupo",
      });
      return;
    }

    try {
      const response = await ApiClient("groups/api/v1/groups", "POST", {
        admin: userContext?.id,
        nameGroup: nameGroup,
      });

      if (response.ok) {
        setAlert({
          visible: true,
          type: "success",
          title: "Grupo Creado",
          message: "Grupo creado exitosamente",
        });
        setIsModalVisible(false);
        setNameGroup("");
      } else {
        setAlert({
          visible: true,
          type: "error",
          title: "Error",
          message: "Hubo un error al crear el grupo.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert({
        visible: true,
        type: "error",
        title: "Error de Conexión",
        message: "Hubo un error al crear el grupo.",
      });
    }
  };

  /** Función para unirse a un grupo */
  const handleJoinGroup = async () => {
    if (!groupCode) {
      setAlert({
        visible: true,
        type: "warning",
        title: "Campos Incompletos",
        message: "Por favor, ingrese el código del grupo.",
      });
      return;
    }

    try {
      const response = await ApiClient(
        `groups/api/v1/groups/join/${groupCode}/${userContext?.id}`,
        "POST"
      );

      if (response.ok) {
        setAlert({
          visible: true,
          type: "success",
          title: "Grupo Unido",
          message: "Te has unido al grupo exitosamente.",
        });
        setIsJoinModalVisible(false);
        setGroupCode("");
      }
    } catch (error) {
      console.log("Error:", error);
      setAlert({
        visible: true,
        type: "error",
        title: "Error de Conexión",
        message: "Hubo un problema inesperado.",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Alert Component */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

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
            <Text style={styles.userText}>
              Hola, {userContext?.userFirstName || "Usuario"}!
            </Text>
            <Text style={styles.email}>
              {userContext?.userEmail || "No disponible"}
            </Text>
            <View style={styles.separator} />
            <Text style={styles.description}>
              Encuentra y únete a grupos para compartir tu ubicación en tiempo
              real.
            </Text>
            <TouchableOpacity
              style={styles.joinGroup}
              onPress={() => setIsJoinModalVisible(true)}
            >
              <Text style={styles.buttonText}>Únete a un grupo</Text>
            </TouchableOpacity>
          </View>

          {/* Crear un grupo */}
          <View style={styles.createContainer}>
            <Icon name="account-group" style={styles.groupIcon} />
            <Text style={styles.userText}>Crea un grupo</Text>
            <View style={styles.separator} />
            <Text style={styles.description}>
              Comparte tu ubicación con amigos o familiares creando un grupo
              privado.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.createButtonText}>Crea un grupo</Text>
            </TouchableOpacity>
          </View>

          {/* Modal para unirse a un grupo */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isJoinModalVisible}
            onRequestClose={() => setIsJoinModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Ingresa el código del grupo
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Código del grupo"
                  value={groupCode}
                  onChangeText={setGroupCode}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleJoinGroup}
                >
                  <Text style={styles.buttonText}>Unirse</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsJoinModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal para crear un grupo */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Ingresa el nombre del grupo
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del grupo"
                  value={nameGroup}
                  onChangeText={setNameGroup}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCreateGroup}
                >
                  <Text style={styles.buttonText}>Crear Grupo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsModalVisible(false)} // Close modal without creating
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default function HomeScreen() {
  return <HomeComponent />;
}
