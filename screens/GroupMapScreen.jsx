import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
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
  const [centerOnUser, setCenterOnUser] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const mapRef = useRef(null);

  const fetchUserMetadata = async (userId) => {
    try {
      const response = await fetch(`http://192.168.1.8:8084/api/v1/users/${userId}`);
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

  const fetchFavoritePlaces = async () => {
    try {
      const response = await fetch(`http://192.168.1.8:8086/api/v1/favoritePlaces/${groupId}`);
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
          Alert.alert("Permiso denegado", "Necesitamos permisos de ubicación.");
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
              setConnectionStatus(`Reintentando (${retryCount}/${maxRetries})...`);
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
          if (!userMetadata[locationData.userId]) fetchUserMetadata(locationData.userId);
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
        Alert.alert("Error de conexión", "No se pudo conectar al servidor.");
      }
    };

    setupConnection();

    return () => {
      stopLocationTracking();
      if (socket) socket.disconnect();
    };
  }, [groupId]);

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

      setTracking(true);
      Alert.alert("Compartiendo ubicación", "Tu ubicación está siendo compartida.");
    } catch (error) {
      console.error("Error al iniciar seguimiento:", error);
      Alert.alert("Error de ubicación", "No se pudo acceder a tu ubicación.");
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
      Alert.alert(
        "Detener compartir ubicación",
        "¿Estás seguro?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Detener", onPress: stopLocationTracking, style: "destructive" },
        ]
      );
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
      Alert.alert(
        "Advertencia",
        "No estás compartiendo tu ubicación. El marcador se colocará en una ubicación predeterminada."
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
      Alert.alert("Error", "Por favor ingresa un nombre para el lugar.");
      return;
    }

    const radius = parseFloat(newPlaceRadius);
    if (isNaN(radius) || radius <= 0) {
      Alert.alert("Error", "Por favor ingresa un radio válido (mayor a 0).");
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
    Alert.alert(
      place.placeName,
      "Selecciona una acción",
      [
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
            Alert.alert(
              "Confirmar eliminación",
              `¿Estás seguro de que deseas eliminar "${place.placeName}"?`,
              [
                { text: "Cancelar", style: "cancel" },
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
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const saveEditedFavoritePlace = () => {
    if (!newPlaceName) {
      Alert.alert("Error", "Por favor ingresa un nombre para el lugar.");
      return;
    }

    const radius = parseFloat(newPlaceRadius);
    if (isNaN(radius) || radius <= 0) {
      Alert.alert("Error", "Por favor ingresa un radio válido (mayor a 0).");
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
    userID === userId ? "#4CAF50" : inactiveUsers.has(userID) ? "#888888" : "#276b80";

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
        mapRef.current.animateToRegion({ ...coords[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
      } else {
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 100, right: 100, bottom: 100, left: 100 }, animated: true });
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
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={userMetadata[locUserId]?.name || `Usuario ${locUserId.substring(0, 5)}`}
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
                center={{ latitude: location.latitude, longitude: location.longitude }}
                radius={location.accuracy}
                strokeWidth={1}
                strokeColor={getMarkerColor(locUserId) + "80"}
                fillColor={getMarkerColor(locUserId) + "20"}
              />
            )}
          </React.Fragment>
        ))}
        {favoritePlaces.map((place, index) => (
          <React.Fragment key={place.id || index}>
            <Marker
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
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
          {Object.keys(locations).length > 0 ? ` • ${Object.keys(locations).length} usuarios` : ""}
        </Text>
      </View>

      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton} onPress={centerMapOnUser}>
          <Text style={styles.mapControlIcon}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlButton} onPress={centerMapOnAll}>
          <Text style={styles.mapControlIcon}>👥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlButton} onPress={handleAddFavoritePlace}>
          <Text style={styles.mapControlIcon}>⭐</Text>
        </TouchableOpacity>
        {tempMarker && (
          <TouchableOpacity style={styles.mapControlButton} onPress={confirmMarkerPosition}>
            <Text style={styles.mapControlIcon}>✔️</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.trackingButton, tracking ? styles.trackingButtonActive : styles.trackingButtonInactive]}
          onPress={toggleTracking}
        >
          <Text style={styles.trackingButtonText}>
            {tracking ? "Detener ubicación en vivo" : "Compartir mi ubicación"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={showUserCard} onRequestClose={() => setShowUserCard(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowUserCard(false)}>
          <View style={styles.userCardContainer}>
            <Card style={styles.userCard}>
              <Card.Title
                title={userMetadata[selectedUser]?.name || `Usuario ${selectedUser?.substring(0, 5)}`}
                subtitle={selectedUser === userId ? "Tú" : inactiveUsers.has(selectedUser) ? "Inactivo" : "Activo"}
              />
              <Card.Content>
                {selectedUser && locations[selectedUser] && (
                  <>
                    <Text style={styles.cardText}>
                      Última actualización: {formatTimestamp(locations[selectedUser].timestamp)}
                    </Text>
                    {locations[selectedUser].speed > 0 && (
                      <Text style={styles.cardText}>
                        Velocidad: {Math.round(locations[selectedUser].speed * 3.6)} km/h
                      </Text>
                    )}
                    {locations[selectedUser].batteryLevel && (
                      <Text style={styles.cardText}>
                        Batería: {Math.round(locations[selectedUser].batteryLevel)}%
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
                <TouchableOpacity style={styles.cardButton} onPress={() => setShowUserCard(false)}>
                  <Text style={styles.cardButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </Card.Actions>
            </Card>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={showPlaceModal} onRequestClose={() => setShowPlaceModal(false)}>
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
            <TouchableOpacity style={styles.saveButton} onPress={saveFavoritePlace}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPlaceModal(false);
                setTempMarker(null);
                setNewPlaceName("");
                setNewPlaceRadius("200");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={showEditModal} onRequestClose={() => setShowEditModal(false)}>
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
            <TouchableOpacity style={styles.saveButton} onPress={saveEditedFavoritePlace}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  map: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#276b80" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  errorText: { marginBottom: 20, fontSize: 16, color: "red", textAlign: "center" },
  retryButton: { backgroundColor: "#276b80", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  retryButtonText: { color: "white", fontSize: 16 },
  buttonContainer: {
    width: "50%",
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
  trackingButton: { paddingVertical: 12, borderRadius: 8, alignItems: "center"},
  trackingButtonActive: { backgroundColor: "#FF6347" },
  trackingButtonInactive: { backgroundColor: "#276b80" },
  trackingButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  statusBar: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 15,
  },
  statusText: { color: "white", fontSize: 14, fontWeight: "500" },
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
  mapControlIcon: { fontSize: 22 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  userCardContainer: { width: "85%", justifyContent: "center", alignItems: "center" },
  userCard: { width: "100%", borderRadius: 10, padding: 5 },
  cardText: { fontSize: 14, marginBottom: 8, color: "#555" },
  divider: { marginVertical: 10 },
  cardButton: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 8 },
  cardButtonText: { color: "#276b80", fontWeight: "bold" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5, width: "100%" },
  saveButton: { backgroundColor: "#276b80", padding: 10, borderRadius: 5, alignItems: "center", width: "100%" },
  saveButtonText: { color: "white" },
  cancelButton: { backgroundColor: "#FF6347", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10, width: "100%" },
  cancelButtonText: { color: "white" },
});

export default GroupMapScreen;