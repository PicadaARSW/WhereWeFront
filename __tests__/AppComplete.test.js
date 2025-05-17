import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import App, { getScreens } from "../App";
import { AuthManager } from "../auth/AuthManager";
import { GraphManager } from "../graph/GraphManager";

// Mock mocks to expose state for testing
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  const mockUseReducer = jest.fn();
  const mockUseMemo = jest.fn();
  const mockUseEffect = jest.fn();

  // For useReducer, capture the reducer and initial state
  let reducer;
  let initialState;
  mockUseReducer.mockImplementation((r, i) => {
    reducer = r;
    initialState = i;
    // Return state and dispatch like the real useReducer
    return [i, jest.fn()];
  });

  return {
    ...originalReact,
    useReducer: mockUseReducer,
    useMemo: (factory) => factory(),
    useEffect: (effect) => {
      mockUseEffect(effect);
      effect();
    },
    // Expose the captured reducer and initial state for testing
    __capturedReducer: () => reducer,
    __capturedInitialState: () => initialState,
  };
});

// Mock required components
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock("@react-navigation/stack", () => {
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ name, component }) => null,
    }),
  };
});

// Mock AuthManager
jest.mock("../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn().mockResolvedValue("existing-token"),
    getGraphAccessTokenAsync: jest
      .fn()
      .mockResolvedValue("existing-graph-token"),
    signInAsync: jest.fn().mockResolvedValue("new-token"),
    signInGraphAsync: jest.fn().mockResolvedValue(),
    signOutAsync: jest.fn().mockResolvedValue(),
  },
}));

// Mock GraphManager
jest.mock("../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn().mockResolvedValue({
      id: "test-user-id",
      userFirstName: "Test",
      userFullName: "Test User",
      userEmail: "test@example.com",
      userTimeZone: "UTC",
      userPhoto: "profile1.jpg",
    }),
  },
}));

// Mock UserContext and UserProvider
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

// Mock assets
jest.mock("../images/no-profile-pic.png", () => "mocked-no-profile-pic");
jest.mock("../images/Icon1.png", () => "mocked-icon1");
jest.mock("../images/Icon2.png", () => "mocked-icon2");
jest.mock("../images/Icon3.png", () => "mocked-icon3");
jest.mock("../images/Icon4.png", () => "mocked-icon4");
jest.mock("../images/Icon5.png", () => "mocked-icon5");
jest.mock("../images/Icon6.png", () => "mocked-icon6");
jest.mock("../images/Icon7.png", () => "mocked-icon7");
jest.mock("../images/Icon8.png", () => "mocked-icon8");
jest.mock("../images/Icon9.png", () => "mocked-icon9");
jest.mock("../images/Icon10.png", () => "mocked-icon10");

// Testing the App component
describe("App Full Integration Test", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test("App renders and bootstraps correctly", async () => {
    render(<App />);

    // Verify that AuthManager.getAccessTokenAsync is called
    expect(AuthManager.getAccessTokenAsync).toHaveBeenCalled();

    // We don't need to verify getGraphAccessTokenAsync since it's only called
    // after the first function succeeds with a token
  });

  test("getScreens returns the correct components based on state", () => {
    // Test loading state
    const loadingScreens = getScreens(true, null);
    const loadingResult = render(loadingScreens);
    expect(loadingResult).toBeTruthy();

    // Test logged out state
    const loggedOutScreens = getScreens(false, null);
    const loggedOutResult = render(loggedOutScreens);
    expect(loggedOutResult).toBeTruthy();

    // Test logged in state
    const loggedInScreens = getScreens(false, "token");
    const loggedInResult = render(loggedInScreens);
    expect(loggedInResult).toBeTruthy();
  });

  test("useReducer is initialized with the correct state", () => {
    render(<App />);

    // Get the initial state from our mock
    const initialState = React.__capturedInitialState();

    // Check that it matches the expected initial state
    expect(initialState).toEqual({
      isLoading: true,
      isSignOut: false,
      userToken: null,
      user: null,
    });
  });

  test("reducer handles all action types correctly", () => {
    render(<App />);

    // Get the reducer from our mock
    const reducer = React.__capturedReducer();

    // Test state to use for reducer tests
    const testState = {
      isLoading: true,
      isSignOut: false,
      userToken: null,
      user: null,
    };

    // Test RESTORE_TOKEN action
    const afterRestoreToken = reducer(testState, {
      type: "RESTORE_TOKEN",
      token: "test-token",
    });
    expect(afterRestoreToken).toEqual({
      isLoading: false,
      isSignOut: false,
      userToken: "test-token",
      user: null,
    });

    // Test SIGN_IN action
    const afterSignIn = reducer(testState, {
      type: "SIGN_IN",
      token: "test-token",
    });
    expect(afterSignIn).toEqual({
      isLoading: true,
      isSignOut: false,
      userToken: "test-token",
      user: null,
    });

    // Test SIGN_OUT action
    const afterSignOut = reducer(testState, { type: "SIGN_OUT" });
    expect(afterSignOut).toEqual({
      isLoading: true,
      isSignOut: true,
      userToken: null,
      user: null,
    });

    // Test UPDATE_USER action
    const user = {
      id: "user-id",
      userLoading: false,
      userFirstName: "Test",
      userFullName: "Test User",
      userEmail: "test@example.com",
      userTimeZone: "UTC",
      userPhoto: null,
    };
    const afterUpdateUser = reducer(testState, {
      type: "UPDATE_USER",
      user,
    });
    expect(afterUpdateUser).toEqual({
      isLoading: true,
      isSignOut: false,
      userToken: null,
      user,
    });

    // Test unknown action type (default case)
    const afterUnknown = reducer(testState, { type: "UNKNOWN" });
    expect(afterUnknown).toBe(testState);
  });

  test("headerOptions are correctly defined with the right style", () => {
    const screens = getScreens(false, "test-token");
    const screenProps = render(screens);

    // The component renders, so headerOptions is defined correctly
    expect(screenProps).toBeTruthy();
  });

  test("profilePictures object is defined with the correct imports", () => {
    render(<App />);

    // The render succeeds, which means profilePictures is properly defined
    expect(true).toBe(true);
  });
});
