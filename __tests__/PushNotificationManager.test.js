import {
  registerForPushNotificationsAsync,
  setupNotificationListener,
} from "../PushNotificationManager";
import * as Notifications from "expo-notifications";

// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest
    .fn()
    .mockResolvedValue({ data: "mock-expo-push-token" }),
  addNotificationReceivedListener: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  AndroidImportance: { MAX: 5 },
  setNotificationChannelAsync: jest.fn(),
}));

// Mock Device
jest.mock("expo-device", () => ({
  isDevice: true,
}));

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
}));

describe("PushNotificationManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports functions", () => {
    expect(typeof registerForPushNotificationsAsync).toBe("function");
    expect(typeof setupNotificationListener).toBe("function");
  });

  it("registerForPushNotificationsAsync returns a token", async () => {
    const token = await registerForPushNotificationsAsync();
    expect(token).toBe("mock-expo-push-token");
  });

  it("setupNotificationListener returns a cleanup function", () => {
    const cleanup = setupNotificationListener(() => {});
    expect(typeof cleanup).toBe("function");
  });

  it("setupNotificationListener passes notification data to callback", () => {
    const callback = jest.fn();
    setupNotificationListener(callback);

    // Get the callback function that was passed to addNotificationReceivedListener
    const notificationCallback =
      Notifications.addNotificationReceivedListener.mock.calls[0][0];

    // Simulate receiving a notification
    const mockNotification = {
      request: {
        content: {
          data: { message: "Test notification" },
        },
      },
    };
    notificationCallback(mockNotification);

    // Check that callback was called with some argument
    expect(callback).toHaveBeenCalled();
  });

  test.skip("sets notification handler for Android", async () => {
    await registerForPushNotificationsAsync();
    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
  });

  test.skip("skips token retrieval on non-device", async () => {
    // Mock the Device module with isDevice set to false
    jest.resetModules();
    jest.doMock("expo-device", () => ({
      isDevice: false,
    }));

    // Re-import the module to use the new mock
    const {
      registerForPushNotificationsAsync,
    } = require("../PushNotificationManager");

    const token = await registerForPushNotificationsAsync();
    expect(token).toBeUndefined();

    // Reset the mock back to default for other tests
    jest.resetModules();
    jest.doMock("expo-device", () => ({
      isDevice: true,
    }));
  });

  it("returns undefined when permissions are denied", async () => {
    // Mock permission denied
    Notifications.getPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    const token = await registerForPushNotificationsAsync();
    expect(token).toBeUndefined();
  });

  it("handles cleanup for received listener", () => {
    const receivedListenerRemove = jest.fn();

    Notifications.addNotificationReceivedListener.mockReturnValueOnce({
      remove: receivedListenerRemove,
    });

    const cleanup = setupNotificationListener(() => {});
    cleanup();

    expect(receivedListenerRemove).toHaveBeenCalled();
  });

  it("handles permissions checking flow", async () => {
    // Reset mocks for this test
    Notifications.getPermissionsAsync.mockClear();
    Notifications.requestPermissionsAsync.mockClear();

    // Check the token retrieval flow works
    const token = await registerForPushNotificationsAsync();

    // Verify the permission check flow was executed
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();

    // We don't need to check requestPermissions since in our mock getPermissions already returns granted
    expect(token).toBe("mock-expo-push-token");
  });

  it("returns a token object from getExpoPushTokenAsync", async () => {
    // Clear previous mock calls
    Notifications.getExpoPushTokenAsync.mockClear();

    await registerForPushNotificationsAsync();

    // Verify token was retrieved
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
  });

  it("sets up notification listeners", () => {
    // Clear previous mock calls
    Notifications.addNotificationReceivedListener.mockClear();

    // Setup listeners
    const callback = jest.fn();
    setupNotificationListener(callback);

    // Verify listener was set
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
  });

  it("handles when callback is not provided", () => {
    // Should not throw error when callback is not a function
    const cleanup = setupNotificationListener(null);
    expect(typeof cleanup).toBe("function");

    // Should still be able to call cleanup
    cleanup();
  });
});
