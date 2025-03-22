import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import LocationSocket from "../location/LocationSocket";
import * as Location from "expo-location";
import { UserContext } from "../UserContext";
import { Card, Divider } from "react-native-paper";

const GroupMapScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { id: userId, userFullName } = useContext(UserContext);
  const [locations, setLocations] = useState({});
  const [socket, setSocket] = useState(null);
  const [tracking, setTracking] = useState(false);
  const locationWatchId = useRef(null);
  const [inactiveUsers, setInactiveUsers] = useState(new Set());
  const [userMetadata, setUserMetadata] = useState({});
  const [initialRegion, setInitialRegion] = useState({
    latitude: 4.60971, // Bogotá coordinates as default
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
  const [centerOnUser, setCenterOnUser] = useState(true);
  const mapRef = useRef(null);

  // Fetch user metadata (name, photo, etc.)
  const fetchUserMetadata = async (userId) => {
    try {
      const response = await fetch(
        `http://192.168.1.21:8084/api/v1/users/${userId}`
      );
      if (response.ok) {
        const userData = await response.json();
        setUserMetadata((prev) => ({
          ...prev,
          [userId]: {
            name: userData.userFullName || `Usuario ${userId.substring(0, 5)}`,
            photo: userData.userPhoto || null,
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching user metadata for ${userId}:`, error);
    }
  };

  // Set up WebSocket connection
  useEffect(() => {
    const setupConnection = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permiso denegado",
            "Necesitamos permisos de ubicación para compartir tu posición"
          );
          setErrorMessage("Permisos de ubicación no concedidos");
          setIsLoading(false);
          return;
        }

        // Get initial position with timeout
        const positionPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Set a timeout in case location takes too long
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout getting location")), 10000)
        );

        const position = await Promise.race([
          positionPromise,
          timeoutPromise,
        ]).catch((error) => {
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

        // Setup socket connection
        const socketInstance = new LocationSocket(groupId);

        // Set retry mechanism
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

        // Fetch user metadata for current user
        await fetchUserMetadata(userId);

        // Set callback to handle received locations
        socketInstance.setLocationCallback((locationData) => {
          // Fetch user metadata if not already loaded
          if (!userMetadata[locationData.userId]) {
            fetchUserMetadata(locationData.userId);
          }

          if (locationData.status === "inactive") {
            setInactiveUsers((prev) => {
              const newSet = new Set(prev);
              newSet.add(locationData.userId);
              return newSet;
            });
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

        // Connect with retry logic
        await connectWithRetry();
        setSocket(socketInstance);
      } catch (error) {
        console.error("Error configurando conexión:", error);
        setConnectionStatus("Error de conexión");
        setErrorMessage("No se pudo conectar al servidor");
        setIsLoading(false);
        Alert.alert(
          "Error de conexión",
          "No se pudo conectar al servidor. Inténtalo de nuevo."
        );
      }
    };

    setupConnection();

    // Cleanup function
    return () => {
      stopLocationTracking();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [groupId]);

  // Battery simulator (in a real app, we would use a native battery API)
  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setBatteryLevel((prev) => {
          const newLevel = Math.max(prev - 0.1, 10);
          return newLevel;
        });
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [tracking]);

  // Start location tracking with more options
  const startLocationTracking = async () => {
    try {
      setInactiveUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      // Start watching position in real-time with better options
      locationWatchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1500, // Update every 1.5 seconds
          distanceInterval: 1, // or when moved 1 meters
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          const locationData = {
            userId: userId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            groupId: groupId,
            status: "active",
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            altitude: position.coords.altitude,
            batteryLevel: batteryLevel,
          };

          // Update local state
          setLocations((prev) => ({
            ...prev,
            [userId]: {
              ...locationData,
              timestamp: new Date().getTime(),
            },
          }));

          // Send to server if connected
          if (socket && socket.connected) {
            socket.sendLocation(locationData);
          }

          // Center map on first location update
          if (mapRef.current && centerOnUser) {
            mapRef.current.animateToRegion(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              500
            );
          }
        }
      );

      // Vibrate device to confirm tracking started
      // If using expo-haptics: Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTracking(true);
      Alert.alert(
        "Compartiendo ubicación",
        "Tu ubicación está siendo compartida con el grupo.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al iniciar seguimiento:", error);
      Alert.alert(
        "Error de ubicación",
        "No se pudo acceder a tu ubicación. Verifica los permisos."
      );
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationWatchId.current) {
      locationWatchId.current.remove();
      locationWatchId.current = null;
    }

    // Mark current user as inactive
    setInactiveUsers((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });

    // Broadcast inactive status to other users
    if (socket && socket.connected && locations[userId]) {
      const inactiveMessage = {
        userId: userId,
        latitude: locations[userId]?.latitude || initialRegion.latitude,
        longitude: locations[userId]?.longitude || initialRegion.longitude,
        groupId: groupId,
        status: "inactive",
        batteryLevel: batteryLevel,
      };
      socket.sendLocation(inactiveMessage);
    }

    setTracking(false);
  };

  // Toggle tracking function
  const toggleTracking = () => {
    if (tracking) {
      Alert.alert(
        "Detener compartir ubicación",
        "¿Estás seguro que deseas dejar de compartir tu ubicación?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Detener",
            onPress: stopLocationTracking,
            style: "destructive",
          },
        ]
      );
    } else {
      startLocationTracking();
    }
  };

  // Handle marker press to show user details
  const handleMarkerPress = (userId) => {
    setSelectedUser(userId);
    setShowUserCard(true);
  };

  // Get marker color based on activity status
  const getMarkerColor = (userID) => {
    if (userID === userId) {
      return "#4CAF50"; // Green for current user
    }
    return inactiveUsers.has(userID) ? "#888888" : "#276b80";
  };

  // Function to format timestamp into readable time
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

  // Center map on all users
  const centerMapOnAll = () => {
    if (Object.keys(locations).length > 0 && mapRef.current) {
      setCenterOnUser(false);

      const coords = Object.values(locations).map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));

      if (coords.length === 1) {
        mapRef.current.animateToRegion(
          {
            latitude: coords[0].latitude,
            longitude: coords[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
        return;
      }

      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // Center map on user's location
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

  // Clean up inactive markers that haven't updated in 10 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      const tenMinutesAgo = now - 10 * 60 * 1000;

      let locationsChanged = false;
      const updatedLocations = { ...locations };

      Object.keys(locations).forEach((locUserId) => {
        // Skip the current user
        if (locUserId === userId) return;

        const location = locations[locUserId];
        if (location.timestamp && location.timestamp < tenMinutesAgo) {
          delete updatedLocations[locUserId];
          locationsChanged = true;
        }
      });

      if (locationsChanged) {
        setLocations(updatedLocations);
      }
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, [locations, userId]);

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#276b80" />
        <Text style={styles.loadingText}>{connectionStatus}</Text>
      </View>
    );
  }

  // Error screen
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
              pinColor={getMarkerColor(locUserId)}
              onPress={() => handleMarkerPress(locUserId)}
            />
            {location.accuracy > 0 && (
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={location.accuracy}
                strokeWidth={1}
                strokeColor={getMarkerColor(locUserId) + "80"}
                fillColor={getMarkerColor(locUserId) + "20"}
              />
            )}
          </React.Fragment>
        ))}
      </MapView>

      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {tracking ? "Compartiendo ubicación" : "No compartiendo"}
          {Object.keys(locations).length > 0
            ? ` • ${Object.keys(locations).length} usuarios`
            : ""}
        </Text>
      </View>

      {/* Map control buttons */}
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
      </View>

      {/* Main button */}
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
            {tracking
              ? "Detener compartir ubicación"
              : "Compartir mi ubicación"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User details modal */}
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

                    <Text style={styles.cardText}>
                      Coordenadas: {locations[selectedUser].latitude.toFixed(6)}
                      ,{locations[selectedUser].longitude.toFixed(6)}
                    </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#276b80",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#276b80",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trackingButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  trackingButtonActive: {
    backgroundColor: "#FF6347",
  },
  trackingButtonInactive: {
    backgroundColor: "#276b80",
  },
  trackingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBar: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 15,
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  mapControls: {
    position: "absolute",
    right: 10,
    bottom: 100,
    flexDirection: "column",
  },
  mapControlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  mapControlIcon: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  userCardContainer: {
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  userCard: {
    width: "100%",
    borderRadius: 10,
    padding: 5,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  divider: {
    marginVertical: 10,
  },
  cardButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  cardButtonText: {
    color: "#276b80",
    fontWeight: "bold",
  },
});

export default GroupMapScreen;
