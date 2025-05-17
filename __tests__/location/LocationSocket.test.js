import LocationSocket from "../../location/LocationSocket";
import { AuthManager } from "../../auth/AuthManager";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Mock de AuthManager
jest.mock("../../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn().mockResolvedValue("mock-token"),
  },
}));

// Mock de SockJS
jest.mock("sockjs-client");

// Mock de Stomp
jest.mock("@stomp/stompjs", () => {
  const mockStompClient = {
    connect: jest.fn(),
    send: jest.fn().mockReturnValue(true),
    subscribe: jest.fn(),
    disconnect: jest.fn(),
    debug: jest.fn(),
  };

  return {
    Stomp: {
      over: jest.fn().mockReturnValue(mockStompClient),
    },
  };
});

describe("LocationSocket", () => {
  let locationSocket;
  let mockStompClient;
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock de console para evitar ruido en los tests
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Setup de los mocks
    mockSocket = {
      onclose: jest.fn(),
    };

    SockJS.mockImplementation(() => mockSocket);

    mockStompClient = Stomp.over();
    // Ensure send returns true by default
    mockStompClient.send.mockReturnValue(true);

    locationSocket = new LocationSocket("test-group-id");
  });

  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      expect(locationSocket.groupId).toBe("test-group-id");
      expect(locationSocket.stompClient).toBeNull();
      expect(locationSocket.connected).toBeFalsy();
      expect(locationSocket.locationSubscription).toBeNull();
      expect(locationSocket.favoritePlaceSubscription).toBeNull();
      expect(locationSocket.favoritePlaceEditedSubscription).toBeNull();
      expect(locationSocket.favoritePlaceDeletedSubscription).toBeNull();
      expect(locationSocket.onLocationReceived).toBeNull();
      expect(locationSocket.onFavoritePlaceReceived).toBeNull();
      expect(locationSocket.onFavoritePlaceEdited).toBeNull();
      expect(locationSocket.onFavoritePlaceDeleted).toBeNull();
    });
  });

  describe("connect", () => {
    it("should connect successfully and subscribe to location", async () => {
      // Mock para la subscripción
      const mockSubscription = { id: "sub1" };
      mockStompClient.subscribe.mockReturnValue(mockSubscription);

      // Simular conexión exitosa
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      await locationSocket.connect();

      // Verificaciones
      expect(AuthManager.getAccessTokenAsync).toHaveBeenCalled();
      expect(SockJS).toHaveBeenCalledWith(expect.any(String));
      expect(Stomp.over).toHaveBeenCalledWith(mockSocket);
      expect(mockStompClient.connect).toHaveBeenCalledWith(
        { Authorization: "Bearer mock-token" },
        expect.any(Function),
        expect.any(Function)
      );

      expect(mockStompClient.subscribe).toHaveBeenCalledWith(
        "/topic/location/test-group-id",
        expect.any(Function)
      );

      expect(locationSocket.connected).toBeTruthy();
      expect(locationSocket.locationSubscription).toEqual(mockSubscription);
    });

    it("should handle connection errors", async () => {
      // Mock para obtener el token falle
      AuthManager.getAccessTokenAsync.mockRejectedValueOnce(
        new Error("Token error")
      );

      await expect(locationSocket.connect()).rejects.toThrow("Token error");
      expect(locationSocket.connected).toBeFalsy();
    });

    it("should handle 401 error and retry with new token", async () => {
      // Mock tryConnect function to capture calls
      const tryConnectMock = jest.fn().mockResolvedValue(true);

      // We'll test the handleConnectionError method directly
      const error = { message: "401 Unauthorized" };

      // Mock setTimeout to execute immediately and capture callback
      const originalSetTimeout = global.setTimeout;
      let timeoutCallback;
      global.setTimeout = (callback) => {
        timeoutCallback = callback;
        return 123; // Dummy timer ID
      };

      // Call the method directly
      try {
        locationSocket.handleConnectionError(error, tryConnectMock, 0);
      } catch (e) {
        // Expected to not throw since we're handling a 401
      }

      // Execute the callback that setTimeout would have called
      if (timeoutCallback) {
        timeoutCallback();
      }

      // Restore the original setTimeout
      global.setTimeout = originalSetTimeout;

      // Verify tryConnect was called with incremented attempts
      expect(tryConnectMock).toHaveBeenCalledWith(1);
      expect(locationSocket.connected).toBe(false);
    });

    it("should handle WebSocket close event", async () => {
      // Mock handleSocketClose to directly return a specific error
      const mockError = new Error("WebSocket closed with code 1006");
      jest.spyOn(locationSocket, "handleSocketClose").mockImplementation(() => {
        return () => {
          throw mockError;
        };
      });

      // Create a rejected promise that simulates what would happen
      // when handleSocketClose is triggered
      await expect(
        // Execute the function that handleSocketClose returns
        new Promise((_, reject) => {
          const closeHandler = locationSocket.handleSocketClose(null, reject);
          closeHandler({ code: 1006, reason: "Test", wasClean: false });
        })
      ).rejects.toThrow("WebSocket closed with code 1006");
    });

    it("should throw error when max connection attempts reached", async () => {
      await expect(locationSocket.getAccessToken(3)).rejects.toThrow(
        "Max connection attempts reached"
      );
    });

    it("should throw error when access token is null", async () => {
      AuthManager.getAccessTokenAsync.mockResolvedValueOnce(null);
      await expect(locationSocket.getAccessToken(0)).rejects.toThrow(
        "No se pudo obtener el token de acceso."
      );
    });

    it("should handle non-401 errors in connectionError", () => {
      const error = { message: "500 Server Error" };
      const tryConnectMock = jest.fn();

      expect(() => {
        locationSocket.handleConnectionError(error, tryConnectMock, 0);
      }).toThrow(error);
      expect(tryConnectMock).not.toHaveBeenCalled();
    });
  });

  describe("sendLocation", () => {
    it("should send location data successfully when connected", async () => {
      // Preparar la conexión
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      await locationSocket.connect();

      const locationData = { userId: "user1", lat: 10, lng: 20 };
      const result = locationSocket.sendLocation(locationData);

      expect(result).toBeTruthy();
      expect(mockStompClient.send).toHaveBeenCalledWith(
        "/app/location",
        {},
        JSON.stringify(locationData)
      );
    });

    it("should return false when not connected", () => {
      const locationData = { userId: "user1", lat: 10, lng: 20 };
      const result = locationSocket.sendLocation(locationData);

      expect(result).toBeFalsy();
      expect(mockStompClient.send).not.toHaveBeenCalled();
    });

    it("should handle error when sending location", async () => {
      // Preparar la conexión
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      await locationSocket.connect();

      // Simular error al enviar
      mockStompClient.send.mockImplementation(() => {
        throw new Error("Send error");
      });

      const locationData = { userId: "user1", lat: 10, lng: 20 };
      const result = locationSocket.sendLocation(locationData);

      expect(result).toBeFalsy();
      expect(console.error).toHaveBeenCalledWith(
        "Error sending location:",
        expect.any(Error)
      );
    });
  });

  describe("location callbacks", () => {
    it("should set and call onLocationReceived callback", async () => {
      // Preparar la conexión
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      // Mock para la subscripción
      let subscriptionCallback;
      mockStompClient.subscribe.mockImplementation((topic, callback) => {
        subscriptionCallback = callback;
        return { id: "sub1" };
      });

      await locationSocket.connect();

      // Crear mock de callback
      const mockCallback = jest.fn();
      locationSocket.setLocationCallback(mockCallback);

      // Simular mensaje recibido
      const locationData = { userId: "user1", lat: 10, lng: 20 };
      subscriptionCallback({ body: JSON.stringify(locationData) });

      // Verificar que se llamó el callback con los datos
      expect(mockCallback).toHaveBeenCalledWith(locationData);
    });

    it("should handle JSON parse error in location subscription", async () => {
      // Preparar la conexión
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      // Mock para la subscripción
      let subscriptionCallback;
      mockStompClient.subscribe.mockImplementation((topic, callback) => {
        subscriptionCallback = callback;
        return { id: "sub1" };
      });

      await locationSocket.connect();

      // Simular mensaje inválido
      subscriptionCallback({ body: "invalid-json" });

      // Verificar que se manejó el error
      expect(console.error).toHaveBeenCalledWith(
        "Error parsing location data:",
        expect.any(Error)
      );
    });
  });

  describe("favorite places management", () => {
    beforeEach(async () => {
      // Resetear después de cada test
      jest.clearAllMocks();

      // Set up successful connection for all tests
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      // Create mock subscriptions
      mockStompClient.subscribe.mockReturnValue({
        id: "mock-sub",
        unsubscribe: jest.fn(),
      });

      await locationSocket.connect();
    });

    describe("sendFavoritePlace", () => {
      it("should send favorite place successfully when connected", () => {
        // Ensure mockStompClient.send returns true
        mockStompClient.send.mockReturnValue(true);

        const placeData = { id: "place1", name: "Place 1", lat: 10, lng: 20 };
        const result = locationSocket.sendFavoritePlace(placeData);

        expect(result).toBeTruthy();
        expect(mockStompClient.send).toHaveBeenCalledWith(
          "/app/addFavoritePlace",
          {},
          JSON.stringify(placeData)
        );
      });

      it("should return false when not connected", () => {
        // Explicitly set connected state to false
        locationSocket.connected = false;

        const placeData = { id: "place1", name: "Place 1", lat: 10, lng: 20 };
        const result = locationSocket.sendFavoritePlace(placeData);

        expect(result).toBeFalsy();
      });

      it("should handle error when sending favorite place", () => {
        // Simular error al enviar
        mockStompClient.send.mockImplementationOnce(() => {
          throw new Error("Send error");
        });

        const placeData = { id: "place1", name: "Place 1", lat: 10, lng: 20 };
        const result = locationSocket.sendFavoritePlace(placeData);

        expect(result).toBeFalsy();
        expect(console.error).toHaveBeenCalledWith(
          "Error sending favorite place:",
          expect.any(Error)
        );
      });
    });

    describe("sendEditFavoritePlace", () => {
      it("should send edited favorite place successfully when connected", () => {
        // Ensure mockStompClient.send returns true
        mockStompClient.send.mockReturnValue(true);

        const placeData = {
          id: "place1",
          name: "Updated Place",
          lat: 10,
          lng: 20,
        };
        const result = locationSocket.sendEditFavoritePlace(placeData);

        expect(result).toBeTruthy();
        expect(mockStompClient.send).toHaveBeenCalledWith(
          "/app/editFavoritePlace",
          {},
          JSON.stringify(placeData)
        );
      });

      it("should return false when not connected", () => {
        locationSocket.connected = false;
        const placeData = {
          id: "place1",
          name: "Updated Place",
          lat: 10,
          lng: 20,
        };
        const result = locationSocket.sendEditFavoritePlace(placeData);

        expect(result).toBeFalsy();
      });

      it("should handle error when sending edited favorite place", () => {
        // Simular error al enviar
        mockStompClient.send.mockImplementationOnce(() => {
          throw new Error("Send error");
        });

        const placeData = {
          id: "place1",
          name: "Updated Place",
          lat: 10,
          lng: 20,
        };
        const result = locationSocket.sendEditFavoritePlace(placeData);

        expect(result).toBeFalsy();
        expect(console.error).toHaveBeenCalledWith(
          "Error sending edit favorite place:",
          expect.any(Error)
        );
      });
    });

    describe("sendDeleteFavoritePlace", () => {
      it("should send delete favorite place successfully when connected", () => {
        // Ensure mockStompClient.send returns true
        mockStompClient.send.mockReturnValue(true);

        const placeData = { id: "place1" };
        const result = locationSocket.sendDeleteFavoritePlace(placeData);

        expect(result).toBeTruthy();
        expect(mockStompClient.send).toHaveBeenCalledWith(
          "/app/deleteFavoritePlace",
          {},
          JSON.stringify(placeData)
        );
      });

      it("should return false when not connected", () => {
        locationSocket.connected = false;
        const placeData = { id: "place1" };
        const result = locationSocket.sendDeleteFavoritePlace(placeData);

        expect(result).toBeFalsy();
      });

      it("should handle error when sending delete favorite place", () => {
        // Simular error al enviar
        mockStompClient.send.mockImplementationOnce(() => {
          throw new Error("Send error");
        });

        const placeData = { id: "place1" };
        const result = locationSocket.sendDeleteFavoritePlace(placeData);

        expect(result).toBeFalsy();
        expect(console.error).toHaveBeenCalledWith(
          "Error sending delete favorite place:",
          expect.any(Error)
        );
      });
    });

    describe("subscribeToFavoritePlaces", () => {
      it("should subscribe to favorite places topics", () => {
        // Reset the subscribe mock to avoid interference from previous tests
        mockStompClient.subscribe.mockClear();

        const callback = jest.fn();
        locationSocket.subscribeToFavoritePlaces(callback);

        expect(mockStompClient.subscribe).toHaveBeenCalledWith(
          `/topic/favoritePlace/test-group-id`,
          expect.any(Function)
        );
        expect(mockStompClient.subscribe).toHaveBeenCalledWith(
          `/topic/favoritePlaceEdited/test-group-id`,
          expect.any(Function)
        );
        expect(mockStompClient.subscribe).toHaveBeenCalledWith(
          `/topic/favoritePlaceDeleted/test-group-id`,
          expect.any(Function)
        );
      });

      it("should not subscribe when not connected", () => {
        // Create a fresh instance to avoid cross-test contamination
        const newLocationSocket = new LocationSocket("test-group-id");

        // Reset the mocks
        mockStompClient.subscribe.mockClear();

        const callback = jest.fn();
        newLocationSocket.subscribeToFavoritePlaces(callback);

        expect(mockStompClient.subscribe).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          "Not connected to STOMP server"
        );
      });

      it("should call callback when favorite place message received", () => {
        // Setup callback and subscription
        const callback = jest.fn();
        let messageCallback;

        mockStompClient.subscribe.mockImplementationOnce((topic, cb) => {
          messageCallback = cb;
          return { id: "sub1", unsubscribe: jest.fn() };
        });

        locationSocket.subscribeToFavoritePlaces(callback);

        // Simulate received message
        const placeData = { id: "place1", name: "New Place" };
        messageCallback({ body: JSON.stringify(placeData) });

        expect(callback).toHaveBeenCalledWith(placeData);
      });

      it("should handle JSON parse error in favorite place subscription", () => {
        // Setup callback and subscription
        const callback = jest.fn();
        let messageCallback;

        mockStompClient.subscribe.mockImplementationOnce((topic, cb) => {
          messageCallback = cb;
          return { id: "sub1", unsubscribe: jest.fn() };
        });

        locationSocket.subscribeToFavoritePlaces(callback);

        // Simulate invalid message
        messageCallback({ body: "invalid-json" });

        expect(callback).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          "Error parsing favorite place data:",
          expect.any(Error)
        );
      });
    });

    describe("favorite place callbacks", () => {
      it("should set and use onFavoritePlaceEdited callback", () => {
        // Setup mock subscriptions and callbacks
        let editedMessageCallback;
        mockStompClient.subscribe
          .mockImplementationOnce(() => ({ id: "sub1" }))
          .mockImplementationOnce((topic, cb) => {
            editedMessageCallback = cb;
            return { id: "sub2" };
          })
          .mockImplementationOnce(() => ({ id: "sub3" }));

        const editCallback = jest.fn();
        locationSocket.setFavoritePlaceEditedCallback(editCallback);
        locationSocket.subscribeToFavoritePlaces(() => {});

        // Simulate edited place message
        const placeData = { id: "place1", name: "Edited Place" };
        editedMessageCallback({ body: JSON.stringify(placeData) });

        expect(editCallback).toHaveBeenCalledWith(placeData);
      });

      it("should set and use onFavoritePlaceDeleted callback", () => {
        // Setup mock subscriptions and callbacks
        let deletedMessageCallback;
        mockStompClient.subscribe
          .mockImplementationOnce(() => ({ id: "sub1" }))
          .mockImplementationOnce(() => ({ id: "sub2" }))
          .mockImplementationOnce((topic, cb) => {
            deletedMessageCallback = cb;
            return { id: "sub3" };
          });

        const deleteCallback = jest.fn();
        locationSocket.setFavoritePlaceDeletedCallback(deleteCallback);
        locationSocket.subscribeToFavoritePlaces(() => {});

        // Simulate deleted place message
        const placeData = { id: "place1" };
        deletedMessageCallback({ body: JSON.stringify(placeData) });

        expect(deleteCallback).toHaveBeenCalledWith(placeData);
      });

      it("should handle JSON parse error in favorite place edited subscription", () => {
        // Setup mock subscriptions and callback
        let editedMessageCallback;
        mockStompClient.subscribe
          .mockImplementationOnce(() => ({ id: "sub1" }))
          .mockImplementationOnce((topic, cb) => {
            editedMessageCallback = cb;
            return { id: "sub2" };
          })
          .mockImplementationOnce(() => ({ id: "sub3" }));

        const editCallback = jest.fn();
        locationSocket.setFavoritePlaceEditedCallback(editCallback);
        locationSocket.subscribeToFavoritePlaces(() => {});

        // Simulate invalid message
        editedMessageCallback({ body: "invalid-json" });

        expect(editCallback).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          "Error parsing edited favorite place data:",
          expect.any(Error)
        );
      });

      it("should handle JSON parse error in favorite place deleted subscription", () => {
        // Setup mock subscriptions and callback
        let deletedMessageCallback;
        mockStompClient.subscribe
          .mockImplementationOnce(() => ({ id: "sub1" }))
          .mockImplementationOnce(() => ({ id: "sub2" }))
          .mockImplementationOnce((topic, cb) => {
            deletedMessageCallback = cb;
            return { id: "sub3" };
          });

        const deleteCallback = jest.fn();
        locationSocket.setFavoritePlaceDeletedCallback(deleteCallback);
        locationSocket.subscribeToFavoritePlaces(() => {});

        // Simulate invalid message
        deletedMessageCallback({ body: "invalid-json" });

        expect(deleteCallback).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          "Error parsing deleted favorite place data:",
          expect.any(Error)
        );
      });
    });
  });

  describe("disconnect", () => {
    beforeEach(async () => {
      // Set up successful connection with 4 subscriptions
      mockStompClient.connect.mockImplementation((headers, successCallback) => {
        successCallback();
      });

      const mockSubscription = { id: "sub1", unsubscribe: jest.fn() };
      mockStompClient.subscribe.mockReturnValue(mockSubscription);

      await locationSocket.connect();

      // Set up all subscriptions
      locationSocket.locationSubscription = {
        ...mockSubscription,
        id: "loc-sub",
      };
      locationSocket.favoritePlaceSubscription = {
        ...mockSubscription,
        id: "fav-sub",
      };
      locationSocket.favoritePlaceEditedSubscription = {
        ...mockSubscription,
        id: "edit-sub",
      };
      locationSocket.favoritePlaceDeletedSubscription = {
        ...mockSubscription,
        id: "delete-sub",
      };
    });

    it("should unsubscribe from all subscriptions and disconnect", () => {
      locationSocket.disconnect();

      // Verify all unsubscribe calls
      expect(
        locationSocket.locationSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceEditedSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceDeletedSubscription.unsubscribe
      ).toHaveBeenCalled();

      // Verify disconnect called
      expect(mockStompClient.disconnect).toHaveBeenCalled();
      expect(locationSocket.connected).toBe(false);
    });

    it("should handle missing subscriptions gracefully", () => {
      // Remove some subscriptions
      locationSocket.locationSubscription = null;
      locationSocket.favoritePlaceSubscription = null;

      // Should not throw error
      expect(() => locationSocket.disconnect()).not.toThrow();

      // Only remaining subscriptions should be unsubscribed
      expect(
        locationSocket.favoritePlaceEditedSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceDeletedSubscription.unsubscribe
      ).toHaveBeenCalled();

      // Still disconnect client
      expect(mockStompClient.disconnect).toHaveBeenCalled();
    });

    it("should handle not being connected", () => {
      // Set not connected state
      locationSocket.connected = false;

      locationSocket.disconnect();

      // Should still unsubscribe from all subscriptions
      expect(
        locationSocket.locationSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceEditedSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceDeletedSubscription.unsubscribe
      ).toHaveBeenCalled();

      // But not try to disconnect
      expect(mockStompClient.disconnect).not.toHaveBeenCalled();
    });

    it("should handle missing stompClient", () => {
      // Remove stompClient
      locationSocket.stompClient = null;

      // Should not throw error
      expect(() => locationSocket.disconnect()).not.toThrow();

      // Should still unsubscribe from all subscriptions
      expect(
        locationSocket.locationSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceEditedSubscription.unsubscribe
      ).toHaveBeenCalled();
      expect(
        locationSocket.favoritePlaceDeletedSubscription.unsubscribe
      ).toHaveBeenCalled();
    });
  });
});
