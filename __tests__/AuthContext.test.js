import React from "react";
import { AuthManager } from "../auth/AuthManager";
import { GraphManager } from "../graph/GraphManager";

// Mock AuthManager
jest.mock("../auth/AuthManager", () => ({
  AuthManager: {
    signInAsync: jest.fn().mockResolvedValue("test-token"),
    signInGraphAsync: jest.fn().mockResolvedValue("test-graph-token"),
    signOutAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock GraphManager
jest.mock("../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn().mockResolvedValue({
      id: "user-id",
      userFirstName: "Test",
      userFullName: "Test User",
      userEmail: "test@example.com",
      userTimeZone: "UTC",
      userPhoto: null,
    }),
  },
}));

// Mock components that will be imported in App.js
jest.mock("@react-navigation/native", () => ({}));
jest.mock("@react-navigation/stack", () => ({}));
jest.mock("../screens/AuthLoadingScreen", () => ({}));
jest.mock("../screens/SignInScreen", () => ({}));
jest.mock("../MainScreen", () => ({}));
jest.mock("../UserContext", () => ({}));

// Mock console.error
const originalConsoleError = console.error;

// Create mock dispatch for testing
const mockDispatch = jest.fn();

// Create test auth context with the functions directly from App.js
const createAuthContext = () => {
  return {
    signIn: async () => {
      try {
        const token = await AuthManager.signInAsync();
        await AuthManager.signInGraphAsync();
        const userData = await GraphManager.getUserAsync();
        if (userData) {
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

// Mock assets
jest.mock("../images/no-profile-pic.png", () => "mocked-no-profile-pic");

// Tests for the authContext functions
describe("AuthContext Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("signIn calls the right methods and returns token", async () => {
    const authContext = createAuthContext();
    const token = await authContext.signIn();

    expect(token).toBe("test-token");
    expect(AuthManager.signInAsync).toHaveBeenCalled();
    expect(AuthManager.signInGraphAsync).toHaveBeenCalled();
    expect(GraphManager.getUserAsync).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_USER",
      user: expect.objectContaining({
        id: "user-id",
      }),
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SIGN_IN",
      token: "test-token",
    });
  });

  it("signIn handles errors correctly", async () => {
    const error = new Error("Sign in failed");
    AuthManager.signInAsync.mockRejectedValueOnce(error);

    const authContext = createAuthContext();
    await expect(authContext.signIn()).rejects.toThrow("Sign in failed");

    expect(console.error).toHaveBeenCalledWith("Sign-in error:", error);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("signOut calls the right methods", async () => {
    const authContext = createAuthContext();
    await authContext.signOut();

    expect(AuthManager.signOutAsync).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_USER",
      user: expect.objectContaining({
        id: "",
        userLoading: true,
      }),
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SIGN_OUT",
    });
  });
});
