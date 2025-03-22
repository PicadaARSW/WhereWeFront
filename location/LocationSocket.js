import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

class LocationSocket {
  constructor(groupId) {
    this.groupId = groupId;
    this.stompClient = null;
    this.connected = false;
    this.locationSubscription = null;
    this.onLocationReceived = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Create a new SockJS instance connecting to your backend
        const socket = new SockJS("http://192.168.1.21:8086/ws");

        // Create a STOMP client over the SockJS socket
        this.stompClient = Stomp.over(socket);

        // Connect to the STOMP server
        this.stompClient.connect(
          {}, // headers (empty in this case)
          () => {
            console.log("Connected to STOMP server");
            this.connected = true;

            // Subscribe to the group's location topic
            this.locationSubscription = this.stompClient.subscribe(
              `/topic/location/${this.groupId}`,
              (message) => {
                try {
                  const locationData = JSON.parse(message.body);
                  console.log("Location received:", locationData);

                  // Call the callback if defined
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

  // Send location to the server
  sendLocation(locationData) {
    if (!this.connected || !this.stompClient) {
      console.error("Not connected to STOMP server");
      return false;
    }

    try {
      this.stompClient.send(
        "/app/location", // This should match your @MessageMapping in Spring
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

  // Set callback for when a location is received
  setLocationCallback(callback) {
    this.onLocationReceived = callback;
  }

  // Disconnect from the STOMP server
  disconnect() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }

    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      console.log("Disconnected from STOMP server");
    }
  }
}

export default LocationSocket;
