import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

class LocationSocket {
  constructor(groupId) {
    this.groupId = groupId;
    this.stompClient = null;
    this.connected = false;
    this.locationSubscription = null;
    this.favoritePlaceSubscription = null;
    this.favoritePlaceEditedSubscription = null;
    this.favoritePlaceDeletedSubscription = null;
    this.onLocationReceived = null;
    this.onFavoritePlaceReceived = null;
    this.onFavoritePlaceEdited = null;
    this.onFavoritePlaceDeleted = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS("http://192.168.1.6:8086/ws");
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect(
          {},
          () => {
            console.log("Connected to STOMP server");
            this.connected = true;

            this.locationSubscription = this.stompClient.subscribe(
              `/topic/location/${this.groupId}`,
              (message) => {
                try {
                  const locationData = JSON.parse(message.body);
                  console.log("Location received:", locationData);
                  if (this.onLocationReceived) {
                    this.onLocationReceived(locationData);
                  }
                } catch (error) {
                  console.error("Error parsing location data:", error);
                }
              }
            );

            resolve();
          },
          (error) => {
            console.error("STOMP connection error:", error);
            this.connected = false;
            reject(error);
          }
        );
      } catch (error) {
        console.error("Error setting up STOMP connection:", error);
        reject(error);
      }
    });
  }

  sendLocation(locationData) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return false;
    }

    try {
      this.stompClient.send(
        "/app/location",
        {},
        JSON.stringify(locationData)
      );
      console.log("Location sent:", locationData);
      return true;
    } catch (error) {
      console.error("Error sending location:", error);
      return false;
    }
  }

  setLocationCallback(callback) {
    this.onLocationReceived = callback;
  }

  sendFavoritePlace(placeData) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return false;
    }

    try {
      this.stompClient.send(
        "/app/addFavoritePlace",
        {},
        JSON.stringify(placeData)
      );
      console.log("Favorite place sent:", placeData);
      return true;
    } catch (error) {
      console.error("Error sending favorite place:", error);
      return false;
    }
  }

  sendEditFavoritePlace(placeData) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return false;
    }

    try {
      this.stompClient.send(
        "/app/editFavoritePlace",
        {},
        JSON.stringify(placeData)
      );
      console.log("Edit favorite place sent:", placeData);
      return true;
    } catch (error) {
      console.error("Error sending edit favorite place:", error);
      return false;
    }
  }

  sendDeleteFavoritePlace(placeData) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return false;
    }

    try {
      this.stompClient.send(
        "/app/deleteFavoritePlace",
        {},
        JSON.stringify(placeData)
      );
      console.log("Delete favorite place sent:", placeData);
      return true;
    } catch (error) {
      console.error("Error sending delete favorite place:", error);
      return false;
    }
  }

  subscribeToFavoritePlaces(callback) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return;
    }

    this.favoritePlaceSubscription = this.stompClient.subscribe(
      `/topic/favoritePlace/${this.groupId}`,
      (message) => {
        try {
          const placeData = JSON.parse(message.body);
          console.log("Favorite place received:", placeData);
          if (callback) callback(placeData);
        } catch (error) {
          console.error("Error parsing favorite place data:", error);
        }
      }
    );

    this.favoritePlaceEditedSubscription = this.stompClient.subscribe(
      `/topic/favoritePlaceEdited/${this.groupId}`,
      (message) => {
        try {
          const placeData = JSON.parse(message.body);
          console.log("Favorite place edited:", placeData);
          if (this.onFavoritePlaceEdited) this.onFavoritePlaceEdited(placeData);
        } catch (error) {
          console.error("Error parsing edited favorite place data:", error);
        }
      }
    );

    this.favoritePlaceDeletedSubscription = this.stompClient.subscribe(
      `/topic/favoritePlaceDeleted/${this.groupId}`,
      (message) => {
        try {
          const placeData = JSON.parse(message.body);
          console.log("Favorite place deleted:", placeData);
          if (this.onFavoritePlaceDeleted) this.onFavoritePlaceDeleted(placeData);
        } catch (error) {
          console.error("Error parsing deleted favorite place data:", error);
        }
      }
    );
  }

  setFavoritePlaceEditedCallback(callback) {
    this.onFavoritePlaceEdited = callback;
  }

  setFavoritePlaceDeletedCallback(callback) {
    this.onFavoritePlaceDeleted = callback;
  }

  disconnect() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.favoritePlaceSubscription) {
      this.favoritePlaceSubscription.unsubscribe();
    }
    if (this.favoritePlaceEditedSubscription) {
      this.favoritePlaceEditedSubscription.unsubscribe();
    }
    if (this.favoritePlaceDeletedSubscription) {
      this.favoritePlaceDeletedSubscription.unsubscribe();
    }

    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      console.log("Disconnected from STOMP server");
    }
  }
}

export default LocationSocket;