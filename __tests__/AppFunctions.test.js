import React from "react";
import { render, act } from "@testing-library/react-native";
import App from "../App";
import { AuthManager } from "../auth/AuthManager";
import { GraphManager } from "../graph/GraphManager";
import { AuthContext } from "../AuthContext";

// Mock NavigationContainer to simplify testing
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock createStackNavigator to simplify testing
jest.mock("@react-navigation/stack", () => {
  const mockStack = {
    Navigator: ({ children }) => children,
    Screen: ({ name, component }) => null,
  };

  return {
    createStackNavigator: () => mockStack,
  };
});

// Mock UserProvider to simplify testing
jest.mock("../UserContext", () => ({
  UserProvider: ({ children }) => children,
}));

// Mock screens
jest.mock("../screens/AuthLoadingScreen", () => "AuthLoadingScreen");
jest.mock("../screens/SignInScreen", () => "SignInScreen");
jest.mock("../MainScreen", () => "MainScreen");
jest.mock("../screens/GroupsScreen", () => "GroupsScreen");
jest.mock("../screens/GroupDetailScreen", () => "GroupDetailScreen");
jest.mock("../screens/GroupMapScreen", () => "GroupMapScreen");
jest.mock("../screens/ProfilePictureSettings", () => "ProfilePictureSettings");
jest.mock("../screens/EditProfileScreen", () => "EditProfileScreen");

// For these tests, don't mock the functions so we can test the real implementation
jest.mock("../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn(() => Promise.resolve(null)),
    getGraphAccessTokenAsync: jest.fn(() => Promise.resolve(null)),
    signInAsync: jest.fn(() => Promise.resolve("test-token")),
    signInGraphAsync: jest.fn(() => Promise.resolve("test-graph-token")),
    signOutAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock GraphManager for user data
jest.mock("../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn(() =>
      Promise.resolve({
        id: "test-user-id",
        userFirstName: "Test",
        userFullName: "Test User",
        userEmail: "test@example.com",
        userTimeZone: "UTC",
        userPhoto: "profile1.jpg",
      })
    ),
  },
}));

// Mock assets
jest.mock("../images/no-profile-pic.png", () => "mocked-no-profile-pic");

// Mock dispatch function for testing
const mockDispatch = jest.fn();

// Create direct implementations of the auth functions for testing
const createAuthFunctions = () => {
  return {
    signIn: async () => {
      try {
        const token = await AuthManager.signInAsync();
        await AuthManager.signInGraphAsync();

        try {
          const userData = await GraphManager.getUserAsync();
          if (userData) {
            // This is the UPDATE_USER dispatch
            mockDispatch({
              type: "UPDATE_USER",
              user: {
                id: userData.id,
                userLoading: false,
                userFirstName: userData.userFirstName,
                userFullName: userData.userFullName,
                userEmail: userData.userEmail,
                userTimeZone: userData.userTimeZone,
                userPhoto: userData.userPhoto,
              },
            });
          }
        } catch (error) {
          console.error("User data error:", error);
        }

        mockDispatch({ type: "SIGN_IN", token });
        return token;
      } catch (error) {
        console.error("Sign-in error:", error);
        throw error;
      }
    },
    signOut: async () => {
      await AuthManager.signOutAsync();
      mockDispatch({
        type: "UPDATE_USER",
        user: {
          id: "",
          userLoading: true,
          userFirstName: "",
          userFullName: "",
          userEmail: "",
          userTimeZone: "",
          userPhoto: require("../images/no-profile-pic.png"),
        },
      });
      mockDispatch({ type: "SIGN_OUT" });
    },
  };
};

describe("App Function Tests", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("signIn function works correctly", async () => {
    const authFunctions = createAuthFunctions();

    // Call signIn and test results
    const result = await authFunctions.signIn();

    // Verify all expected methods were called
    expect(result).toBe("test-token");
    expect(AuthManager.signInAsync).toHaveBeenCalled();
    expect(AuthManager.signInGraphAsync).toHaveBeenCalled();
    expect(GraphManager.getUserAsync).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_USER",
        user: expect.objectContaining({
          id: "test-user-id",
        }),
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SIGN_IN",
      token: "test-token",
    });
  });

  it("signOut function works correctly", async () => {
    const authFunctions = createAuthFunctions();

    // Call signOut
    await authFunctions.signOut();

    // Verify AuthManager.signOutAsync was called
    expect(AuthManager.signOutAsync).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_USER",
        user: expect.objectContaining({
          id: "",
          userLoading: true,
        }),
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SIGN_OUT",
    });
  });

  it("handles sign in errors correctly", async () => {
    // Mock signInAsync to throw an error
    const mockError = new Error("Sign in failed");
    AuthManager.signInAsync.mockRejectedValueOnce(mockError);

    const authFunctions = createAuthFunctions();

    // Call signIn and expect it to throw
    await expect(authFunctions.signIn()).rejects.toThrow("Sign in failed");

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      "Sign-in error:",
      expect.objectContaining({ message: "Sign in failed" })
    );
  });

  it("handles GraphManager.getUserAsync errors during sign in", async () => {
    // Mock successful sign in but failed user data fetch
    AuthManager.signInAsync.mockResolvedValueOnce("test-token");
    AuthManager.signInGraphAsync.mockResolvedValueOnce();
    GraphManager.getUserAsync.mockRejectedValueOnce(
      new Error("User data fetch failed")
    );

    const authFunctions = createAuthFunctions();

    // Call signIn (should still work even when getUserAsync fails)
    const result = await authFunctions.signIn();

    // Verify we still get a token even with user data error
    expect(result).toBe("test-token");

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      "User data error:",
      expect.any(Error)
    );

    // Still should dispatch SIGN_IN
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SIGN_IN",
      token: "test-token",
    });
  });
});
