import LocationSocket from "../../location/LocationSocket";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

// Mock dependencies
jest.mock("../../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn().mockResolvedValue("mock-token"),
  },
}));

jest.mock("sockjs-client", () => {
  return jest.fn().mockImplementation(() => ({
    onclose: null,
  }));
});

jest.mock("@stomp/stompjs", () => ({
  Stomp: {
    over: jest.fn().mockImplementation(() => ({
      connect: jest.fn((headers, success, error) => {
        // Call success callback to simulate connection
        success();
      }),
      subscribe: jest.fn().mockReturnValue({
        id: "mock-subscription",
        unsubscribe: jest.fn(),
      }),
      send: jest.fn(),
      debug: null,
      disconnect: jest.fn(),
    })),
  },
}));

describe("LocationSocket", () => {
  let locationSocket;
  const groupId = "test-group-id";

  beforeEach(() => {
    jest.clearAllMocks();
    locationSocket = new LocationSocket(groupId);
  });

  it("file exists", () => {
    const fs = require("fs");
    const path = "./location/LocationSocket.js";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be required without errors", () => {
    expect(() => {
      require("../../location/LocationSocket");
    }).not.toThrow();
  });

  it("initializes with correct properties", () => {
    expect(locationSocket.groupId).toBe(groupId);
    expect(locationSocket.connected).toBe(false);
    expect(locationSocket.stompClient).toBeNull();
  });

  it("connects to the WebSocket server", async () => {
    await locationSocket.connect();

    expect(SockJS).toHaveBeenCalledWith(
      expect.stringContaining("wherewe-locations")
    );
    expect(Stomp.over).toHaveBeenCalled();
    expect(locationSocket.connected).toBe(true);
  });

  it("handles location callbacks", () => {
    const callback = jest.fn();
    locationSocket.setLocationCallback(callback);
    expect(locationSocket.onLocationReceived).toBe(callback);
  });

  it("sends location data when connected", async () => {
    await locationSocket.connect();

    const locationData = { lat: 123, lng: 456, userId: "test-user" };
    locationSocket.sendLocation(locationData);

    expect(locationSocket.stompClient.send).toHaveBeenCalledWith(
      "/app/location",
      {},
      JSON.stringify(locationData)
    );
  });

  it("doesn't send location data when not connected", () => {
    const locationData = { lat: 123, lng: 456, userId: "test-user" };
    const result = locationSocket.sendLocation(locationData);

    expect(result).toBe(false);
    expect(locationSocket.stompClient).toBeNull();
  });

  it("handles favorite place functionality", async () => {
    await locationSocket.connect();

    const placeData = { name: "Test Place", lat: 123, lng: 456 };
    locationSocket.sendFavoritePlace(placeData);

    expect(locationSocket.stompClient.send).toHaveBeenCalledWith(
      "/app/addFavoritePlace",
      {},
      JSON.stringify(placeData)
    );
  });

  it("sets favorite place callbacks", () => {
    const editCallback = jest.fn();
    const deleteCallback = jest.fn();

    locationSocket.setFavoritePlaceEditedCallback(editCallback);
    locationSocket.setFavoritePlaceDeletedCallback(deleteCallback);

    expect(locationSocket.onFavoritePlaceEdited).toBe(editCallback);
    expect(locationSocket.onFavoritePlaceDeleted).toBe(deleteCallback);
  });

  it("disconnects properly", async () => {
    await locationSocket.connect();

    // Access the mock subscription returned by stompClient.subscribe
    const mockSubscription =
      locationSocket.stompClient.subscribe.mock.results[0].value;
    locationSocket.locationSubscription = mockSubscription;

    locationSocket.disconnect();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(locationSocket.stompClient.disconnect).toHaveBeenCalled();
  });
});
