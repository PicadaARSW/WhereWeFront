import React, { useEffect, useState, useContext, useRef } from "react";
import {View,Alert,Text,TouchableOpacity,Modal,ActivityIndicator,TextInput,Image,} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import LocationSocket from "../location/LocationSocket";
import * as Location from "expo-location";
import { UserContext } from "../UserContext";
import { Card, Divider } from "react-native-paper";
import CustomAlert from "../components/CustomAlert";
import styles from "../styles/GroupMapScreenStyles";
import { registerForPushNotificationsAsync, setupNotificationListener} from "../PushNotificationManager";

const profilePictures = {
  "profile1.jpg": require("../images/Icon1.png"),
  "profile2.jpg": require("../images/Icon2.png"),
  "profile3.jpg": require("../images/Icon3.png"),
  "profile4.jpg": require("../images/Icon4.png"),
  "profile5.jpg": require("../images/Icon5.png"),
  "profile6.jpg": require("../images/Icon6.png"),
  "profile7.jpg": require("../images/Icon7.png"),
  "profile8.jpg": require("../images/Icon8.png"),
  "profile9.jpg": require("../images/Icon9.png"),
  "profile10.jpg": require("../images/Icon10.png"),
};

const GroupMapScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { id: userId, userFullName, userPhoto } = useContext(UserContext);
  const [pushToken, setPushToken] = useState(null);
  const [locations, setLocations] = useState({});
  const [socket, setSocket] = useState(null);
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceRadius, setNewPlaceRadius] = useState("200");
  const [tempMarker, setTempMarker] = useState(null);
  const [tracking, setTracking] = useState(false);
  const locationWatchId = useRef(null);
  const [inactiveUsers, setInactiveUsers] = useState(new Set());
  const [userMetadata, setUserMetadata] = useState({});
  const [initialRegion, setInitialRegion] = useState({
    latitude: 4.60971,
    longitude: -74.08175,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");
  const [isConnecting, setIsConnecting] = useState(true);
  const [showUserCard, setShowUserCard] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [centerOnUser, setCenterOnUser] = useState(false); // Changed to false to disable automatic centering
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const mapRef = useRef(null);

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

  const fetchUserMetadata = async (userId) => {
    try {
      const response = await fetch(
        `http://192.168.1.8:8084/api/v1/users/${userId}`
      );
      if (response.ok) {
        const userData = await response.json();
        setUserMetadata((prev) => ({
          ...prev,
          [userId]: {
            name: userData.userFullName || `Usuario ${userId.substring(0, 5)}`,
            photo: userData.profilePicture || null,
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching user metadata for ${userId}:`, error);
    }
  };

  const fetchFavoritePlaces = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.8:8086/api/v1/favoritePlaces/${groupId}`
      );
      if (response.ok) {
        const places = await response.json();
        setFavoritePlaces(places);
      }
    } catch (error) {
      console.error("Error fetching favorite places:", error);
    }
  };

  useEffect(() => {
    const setupConnection = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          showCustomAlert(
            "Permiso denegado",
            "Necesitamos permisos de ubicación.",
            [{ text: "OK", onPress: () => {} }]
          );
          setErrorMessage("Permisos de ubicación no concedidos");
          setIsLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).catch((error) => {
          console.warn("Falling back to default location:", error);
          return { coords: { latitude: 4.60971, longitude: -74.08175 } };
        });

        const newRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialRegion(newRegion);

        const socketInstance = new LocationSocket(groupId);
        let retryCount = 0;
        const maxRetries = 3;

        const connectWithRetry = async () => {
          try {
            setConnectionStatus(`Conectando${".".repeat(retryCount + 1)}`);
            await socketInstance.connect();
            setConnectionStatus("Conectado");
            setIsConnecting(false);
            setIsLoading(false);
            return true;
          } catch (error) {
            retryCount++;
            if (retryCount <= maxRetries) {
              setConnectionStatus(
                `Reintentando (${retryCount}/${maxRetries})...`
              );
              await new Promise((r) => setTimeout(r, 2000));
              return connectWithRetry();
            }
            throw error;
          }
        };

        await fetchUserMetadata(userId);
        await fetchFavoritePlaces();
        await connectWithRetry();

        socketInstance.setLocationCallback((locationData) => {
          if (!userMetadata[locationData.userId])
            fetchUserMetadata(locationData.userId);
          if (locationData.status === "inactive") {
            setInactiveUsers((prev) => new Set(prev).add(locationData.userId));
          } else {
            setInactiveUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(locationData.userId);
              return newSet;
            });
          }
          setLocations((prev) => ({
            ...prev,
            [locationData.userId]: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              userId: locationData.userId,
              timestamp: new Date().getTime(),
              accuracy: locationData.accuracy || 0,
              speed: locationData.speed || 0,
              heading: locationData.heading || 0,
              batteryLevel: locationData.batteryLevel || 100,
            },
          }));
        });

        socketInstance.subscribeToFavoritePlaces((placeData) => {
          setFavoritePlaces((prev) => [...prev, placeData]);
        });

        socketInstance.setFavoritePlaceEditedCallback((placeData) => {
          setFavoritePlaces((prev) =>
            prev.map((place) =>
              place.id === placeData.id ? { ...place, ...placeData } : place
            )
          );
        });

        socketInstance.setFavoritePlaceDeletedCallback((placeData) => {
          setFavoritePlaces((prev) =>
            prev.filter((place) => place.id !== placeData.id)
          );
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error("Error configurando conexión:", error);
        setConnectionStatus("Error de conexión");
        setErrorMessage("No se pudo conectar al servidor");
        setIsLoading(false);
        showCustomAlert(
          "Error de conexión",
          "No se pudo conectar al servidor.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    };

    setupConnection();

    return () => {
      stopLocationTracking();
      if (socket) socket.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    const setupNotifications = async () => {
        console.log("Configurando notificaciones para:", { userId, groupId });
        const token = await registerForPushNotificationsAsync();
        console.log("Token recibido en GroupMapScreen:", token);
        setPushToken(token);
        if (token) {
            try {
                console.log("Enviando token al backend...");
                const response = await fetch("http://192.168.1.8:8086/api/v1/users/push-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, pushToken: token, groupId }),
                });
                console.log("Respuesta del backend:", response.status);
            } catch (error) {
                console.error("Error al enviar el token al backend:", error);
            }
        }
    };
    setupNotifications();
    const unsubscribe = setupNotificationListener((remoteMessage) => {
      console.log("Procesando notificación en GroupMapScreen:", remoteMessage);
      Alert.alert(
          remoteMessage.notification.title,
          remoteMessage.notification.body
      );
  });

  return () => unsubscribe();
}, [userId, groupId]);

  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setBatteryLevel((prev) => Math.max(prev - 0.1, 10));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [tracking]);

  const startLocationTracking = async () => {
    try {
      setInactiveUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      locationWatchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1500,
          distanceInterval: 1,
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          const locationData = {
            userId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            groupId,
            status: "active",
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            altitude: position.coords.altitude,
            batteryLevel,
          };

          setLocations((prev) => ({
            ...prev,
            [userId]: { ...locationData, timestamp: new Date().getTime() },
          }));

          if (socket && socket.connected) socket.sendLocation(locationData);

          // Removed automatic centering logic from here
        }
      );

      setTracking(true);
      showCustomAlert(
        "Compartiendo ubicación",
        "Tu ubicación está siendo compartida.",
        [{ text: "OK", onPress: () => {} }]
      );
    } catch (error) {
      console.error("Error al iniciar seguimiento:", error);
      showCustomAlert(
        "Error de ubicación",
        "No se pudo acceder a tu ubicación.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  const stopLocationTracking = () => {
    if (locationWatchId.current) {
      locationWatchId.current.remove();
      locationWatchId.current = null;
    }

    setInactiveUsers((prev) => new Set(prev).add(userId));

    if (socket && socket.connected && locations[userId]) {
      const inactiveMessage = {
        userId,
        latitude: locations[userId]?.latitude || initialRegion.latitude,
        longitude: locations[userId]?.longitude || initialRegion.longitude,
        groupId,
        status: "inactive",
        batteryLevel,
      };
      socket.sendLocation(inactiveMessage);
    }

    setTracking(false);
  };

  const toggleTracking = () => {
    if (tracking) {
      showCustomAlert("Detener compartir ubicación", "¿Estás seguro?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Detener",
          style: "destructive",
          onPress: stopLocationTracking,
        },
      ]);
    } else {
      startLocationTracking();
    }
  };

  const handleAddFavoritePlace = () => {
    let coords;
    if (tracking && locations[userId]) {
      coords = {
        latitude: locations[userId].latitude,
        longitude: locations[userId].longitude,
      };
    } else {
      coords = {
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      };
      showCustomAlert(
        "Advertencia",
        "No estás compartiendo tu ubicación. El marcador se colocará en una ubicación predeterminada.",
        [{ text: "OK", onPress: () => {} }]
      );
    }

    setTempMarker(coords);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  };

  const handleMarkerDragStart = (e) => {
    console.log("Drag started at:", e.nativeEvent.coordinate);
  };

  const handleMarkerDrag = (e) => {
    console.log("Dragging to:", e.nativeEvent.coordinate);
  };

  const handleMarkerDragEnd = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    console.log("Drag ended at:", newCoords);
    setTempMarker({ ...newCoords });
  };

  const confirmMarkerPosition = () => {
    if (!tempMarker) {
      Alert.alert("Error", "Por favor coloca un marcador en el mapa.");
      return;
    }
    setShowPlaceModal(true);
  };

  const saveFavoritePlace = () => {
    if (!newPlaceName) {
      showCustomAlert("Error", "Por favor ingresa un nombre para el lugar.", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    const radius = parseFloat(newPlaceRadius);
    if (isNaN(radius) || radius <= 0) {
      showCustomAlert(
        "Error",
        "Por favor ingresa un radio válido (mayor a 0).",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    const placeData = {
      placeName: newPlaceName,
      latitude: tempMarker.latitude,
      longitude: tempMarker.longitude,
      groupId,
      radius,
    };

    if (socket && socket.connected) {
      socket.sendFavoritePlace(placeData);
    }

    setNewPlaceName("");
    setNewPlaceRadius("200");
    setTempMarker(null);
    setShowPlaceModal(false);
  };

  const handleFavoritePlacePress = (place) => {
    showCustomAlert(place.placeName, "Selecciona una acción", [
      {
        text: "Editar",
        onPress: () => {
          setEditingPlace(place);
          setNewPlaceName(place.placeName);
          setNewPlaceRadius(place.radius.toString());
          setShowEditModal(true);
        },
      },
      {
        text: "Eliminar",
        onPress: () => {
          showCustomAlert(
            "Confirmar eliminación",
            `¿Estás seguro de que deseas eliminar "${place.placeName}"?`,
            [
              {
                text: "Cancelar",
                style: "cancel",
                onPress: () => {},
              },
              {
                text: "Eliminar",
                style: "destructive",
                onPress: () => {
                  if (socket && socket.connected) {
                    socket.sendDeleteFavoritePlace(place);
                  }
                },
              },
            ]
          );
        },
        style: "destructive",
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const saveEditedFavoritePlace = () => {
    if (!newPlaceName) {
      showCustomAlert("Error", "Por favor ingresa un nombre para el lugar.", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    const radius = parseFloat(newPlaceRadius);
    if (isNaN(radius) || radius <= 0) {
      showCustomAlert(
        "Error",
        "Por favor ingresa un radio válido (mayor a 0).",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    const updatedPlace = {
      ...editingPlace,
      placeName: newPlaceName,
      radius,
    };

    if (socket && socket.connected) {
      socket.sendEditFavoritePlace(updatedPlace);
    }

    setNewPlaceName("");
    setNewPlaceRadius("200");
    setEditingPlace(null);
    setShowEditModal(false);
  };

  const handleMarkerPress = (userId) => {
    setSelectedUser(userId);
    setShowUserCard(true);
  };

  const getMarkerColor = (userID) =>
    userID === userId
      ? "#4CAF50"
      : inactiveUsers.has(userID)
      ? "#888888"
      : "#276b80";

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Desconocido";
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins === 1) return "Hace 1 minuto";
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  };

  const centerMapOnAll = () => {
    if (Object.keys(locations).length > 0 && mapRef.current) {
      setCenterOnUser(false);
      const coords = Object.values(locations).map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      if (coords.length === 1) {
        mapRef.current.animateToRegion(
          { ...coords[0], latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500
        );
      } else {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }
    }
  };

  const centerMapOnUser = () => {
    if (locations[userId] && mapRef.current) {
      setCenterOnUser(true);
      mapRef.current.animateToRegion(
        {
          latitude: locations[userId].latitude,
          longitude: locations[userId].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  };

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      const tenMinutesAgo = now - 10 * 60 * 1000;
      let locationsChanged = false;
      const updatedLocations = { ...locations };

      Object.keys(locations).forEach((locUserId) => {
        if (locUserId === userId) return;
        const location = locations[locUserId];
        if (location.timestamp && location.timestamp < tenMinutesAgo) {
          delete updatedLocations[locUserId];
          locationsChanged = true;
        }
      });

      if (locationsChanged) setLocations(updatedLocations);
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, [locations, userId]);

  const getProfileImage = (photoUrl) => {
    if (!photoUrl) return require("../images/no-profile-pic.png");
    const index =
      parseInt(photoUrl.replace("profile", "").replace(".jpg", "")) - 1;
    return (
      profilePictures[`profile${index + 1}.jpg`] ||
      require("../images/no-profile-pic.png")
    );
  };

  const getZIndex = (userId) => {
    return userId.charCodeAt(0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#276b80" />
        <Text style={styles.loadingText}>{connectionStatus}</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {errorMessage}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace("GroupMapScreen", { groupId })}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        onPanDrag={() => setCenterOnUser(false)}
      >
        {Object.entries(locations).map(([locUserId, location]) => (
          <React.Fragment key={locUserId}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={
                userMetadata[locUserId]?.name ||
                `Usuario ${locUserId.substring(0, 5)}`
              }
              description={
                inactiveUsers.has(locUserId)
                  ? "Inactivo desde " + formatTimestamp(location.timestamp)
                  : "Activo - " + formatTimestamp(location.timestamp)
              }
              onPress={() => handleMarkerPress(locUserId)}
              anchor={{ x: 0.4, y: 0.4 }}
              flat={true}
              zIndex={getZIndex(locUserId)}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 50,
                  padding: 0.2,
                  borderWidth: 3,
                  borderColor: getMarkerColor(locUserId),
                }}
              >
                <Image
                  source={
                    locUserId === userId
                      ? userPhoto
                      : getProfileImage(userMetadata[locUserId]?.photo)
                  }
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 50,
                  }}
                  resizeMode="cover"
                />
              </View>
            </Marker>
            {location.accuracy > 0 && (
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={location.accuracy}
                strokeWidth={2}
                strokeColor={getMarkerColor(locUserId) + "80"}
                fillColor={getMarkerColor(locUserId) + "20"}
              />
            )}
          </React.Fragment>
        ))}
        {favoritePlaces.map((place, index) => (
          <React.Fragment key={place.id || index}>
            <Marker
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.placeName}
              pinColor="#FF6347"
              onPress={() => handleFavoritePlacePress(place)}
            />
            <Circle
              center={{ latitude: place.latitude, longitude: place.longitude }}
              radius={place.radius || 200}
              strokeWidth={1}
              strokeColor="#FF6347"
              fillColor="rgba(197, 99, 71, 0.2)"
            />
          </React.Fragment>
        ))}
        {tempMarker && (
          <Marker
            coordinate={tempMarker}
            pinColor="#FFD700"
            draggable
            onDragStart={handleMarkerDragStart}
            onDrag={handleMarkerDrag}
            onDragEnd={handleMarkerDragEnd}
            title="Nuevo lugar favorito"
            description="Mantén presionado y arrastra para ajustar la posición"
          />
        )}
      </MapView>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {tracking ? "Compartiendo ubicación" : "No compartiendo"}
          {Object.keys(locations).length > 0
            ? ` • ${Object.keys(locations).length} usuarios`
            : ""}
        </Text>
      </View>

      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.mapControlButton}
          onPress={centerMapOnUser}
        >
          <Text style={styles.mapControlIcon}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapControlButton}
          onPress={centerMapOnAll}
        >
          <Text style={styles.mapControlIcon}>👥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapControlButton}
          onPress={handleAddFavoritePlace}
        >
          <Text style={styles.mapControlIcon}>⭐</Text>
        </TouchableOpacity>
        {tempMarker && (
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={confirmMarkerPosition}
          >
            <Text style={styles.mapControlIcon}>✔️</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.trackingButton,
            tracking
              ? styles.trackingButtonActive
              : styles.trackingButtonInactive,
          ]}
          onPress={toggleTracking}
        >
          <Text style={styles.trackingButtonText}>
            {tracking ? "Detener ubicación en vivo" : "Compartir mi ubicación"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showUserCard}
        onRequestClose={() => setShowUserCard(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserCard(false)}
        >
          <View style={styles.userCardContainer}>
            <Card style={styles.userCard}>
              <Card.Title
                title={
                  userMetadata[selectedUser]?.name ||
                  `Usuario ${selectedUser?.substring(0, 5)}`
                }
                subtitle={
                  selectedUser === userId
                    ? "Tú"
                    : inactiveUsers.has(selectedUser)
                    ? "Inactivo"
                    : "Activo"
                }
              />
              <Card.Content>
                {selectedUser && locations[selectedUser] && (
                  <>
                    <Text style={styles.cardText}>
                      Última actualización:{" "}
                      {formatTimestamp(locations[selectedUser].timestamp)}
                    </Text>
                    {locations[selectedUser].speed > 0 && (
                      <Text style={styles.cardText}>
                        Velocidad:{" "}
                        {Math.round(locations[selectedUser].speed * 3.6)} km/h
                      </Text>
                    )}
                    {locations[selectedUser].batteryLevel && (
                      <Text style={styles.cardText}>
                        Batería:{" "}
                        {Math.round(locations[selectedUser].batteryLevel)}%
                      </Text>
                    )}
                    <Divider style={styles.divider} />
                  </>
                )}
              </Card.Content>
              <Card.Actions>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => {
                    setShowUserCard(false);
                    if (locations[selectedUser]) {
                      mapRef.current.animateToRegion(
                        {
                          latitude: locations[selectedUser].latitude,
                          longitude: locations[selectedUser].longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        },
                        500
                      );
                    }
                  }}
                >
                  <Text style={styles.cardButtonText}>Centrar Mapa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => setShowUserCard(false)}
                >
                  <Text style={styles.cardButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </Card.Actions>
            </Card>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPlaceModal}
        onRequestClose={() => setShowPlaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del lugar"
              value={newPlaceName}
              onChangeText={setNewPlaceName}
            />
            <TextInput
              style={styles.input}
              placeholder="Radio (metros)"
              value={newPlaceRadius}
              onChangeText={setNewPlaceRadius}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveFavoritePlace}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPlaceModal(false);
                setTempMarker(null);
                setNewPlaceName("");
                setNewPlaceRadius("100");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar lugar favorito</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del lugar"
              value={newPlaceName}
              onChangeText={setNewPlaceName}
            />
            <TextInput
              style={styles.input}
              placeholder="Radio (metros)"
              value={newPlaceRadius}
              onChangeText={setNewPlaceRadius}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveEditedFavoritePlace}
            >
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingPlace(null);
                setNewPlaceName("");
                setNewPlaceRadius("200");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

export default GroupMapScreen;
