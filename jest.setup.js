jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Animated = {
    Value: jest.fn(),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
  };
  return RN;
});

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View,
  };
});

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

jest.mock("react-native-gesture-handler", () => ({}));

global.fetch = jest.fn();
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock para expo-modules-core (necesario para expo-auth-session)
jest.mock("expo-modules-core", () => {
  return {
    EventEmitter: {
      emit: jest.fn(),
    },
  };
});

// Mock para expo-auth-session
jest.mock("expo-auth-session", () => ({
  exchangeCodeAsync: jest.fn(),
  loadAsync: jest.fn(),
  makeRedirectUri: jest.fn(),
  useAuthRequest: jest.fn().mockReturnValue([null, null, jest.fn()]),
  AuthSession: {
    getDefaultReturnUrl: jest.fn(),
  },
  // Añade más funciones si las necesitas
}));

// Añade este mock para @react-navigation/drawer
jest.mock("@react-navigation/drawer", () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock para expo-device
jest.mock("expo-device", () => ({
  isDevice: true,
  brand: "TestDevice",
  manufacturer: "TestManufacturer",
  modelName: "TestModel",
  designName: "TestDesign",
  productName: "TestProduct",
  deviceYearClass: 2023,
  totalMemory: 8192,
  supportedCpuArchitectures: ["x86_64"],
  osName: "TestOS",
  osVersion: "1.0.0",
  osBuildId: "TEST123",
  osInternalBuildId: "TEST123",
  osBuildFingerprint: "test-fingerprint",
  platformApiLevel: 30,
  deviceName: "TestDevice",
  getDeviceTypeAsync: jest.fn().mockResolvedValue(1),
  getPlatformFeaturesAsync: jest.fn().mockResolvedValue(["test-feature"]),
  hasPlatformFeatureAsync: jest.fn().mockResolvedValue(true),
  isRootedExperimentalAsync: jest.fn().mockResolvedValue(false),
  isSideLoadingEnabledAsync: jest.fn().mockResolvedValue(false),
  getUptimeAsync: jest.fn().mockResolvedValue(3600),
}));
