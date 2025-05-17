import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import SignInScreen from "../../screens/SignInScreen";
import { AuthContext } from "../../AuthContext";
import { UserContext } from "../../UserContext";
import { GraphManager } from "../../graph/GraphManager";

// Mock dependencies
jest.mock("../../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn(),
  },
}));

// Mock react-native Alert
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Mock images
jest.mock("../../assets/WhereWeImg.jpg", () => "mocked-background-image", {
  virtual: true,
});
jest.mock("../../images/no-profile-pic.png", () => "mocked-profile-image", {
  virtual: true,
});

describe("SignInScreen", () => {
  // Mock functions and values
  const mockSignIn = jest.fn();
  const mockSetUser = jest.fn();
  const mockAuthContext = { signIn: mockSignIn };
  const mockUserContext = { setUser: mockSetUser };

  // Mock user data
  const mockUser = {
    id: "test-user-id",
    userFirstName: "Test",
    userFullName: "Test User",
    userEmail: "test@example.com",
    userTimeZone: "UTC",
    userPhoto: "test-photo-url",
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error to catch and test error logging
  });

  it("renders correctly with all UI elements", () => {
    const { getByText, getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <SignInScreen />
        </UserContext.Provider>
      </AuthContext.Provider>
    );

    // Check main title
    expect(getByTestId("main-title")).toBeTruthy();
    expect(getByText("Where We!")).toBeTruthy();

    // Check welcome text
    expect(getByTestId("welcome-title")).toBeTruthy();
    expect(getByText("Bienvenido")).toBeTruthy();
    expect(getByTestId("welcome-paragraph")).toBeTruthy();
    expect(getByText("Inicio de Sesión en WhereWe!")).toBeTruthy();

    // Check sign in button
    expect(getByTestId("sign-in-button")).toBeTruthy();
    expect(getByText("Iniciar Sesión")).toBeTruthy();

    // Check background image
    expect(getByTestId("background-image")).toBeTruthy();

    // Check card container
    expect(getByTestId("card")).toBeTruthy();
  });

  it("calls signIn when the button is pressed and handles success", async () => {
    // Mock successful sign-in
    mockSignIn.mockResolvedValueOnce();
    GraphManager.getUserAsync.mockResolvedValueOnce(mockUser);

    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <SignInScreen />
        </UserContext.Provider>
      </AuthContext.Provider>
    );

    // Find and press the sign-in button
    const signInButton = getByTestId("sign-in-button");
    fireEvent.press(signInButton);

    // Wait for async functions to resolve
    await waitFor(() => {
      // Check if signIn was called
      expect(mockSignIn).toHaveBeenCalled();

      // Check if getUserAsync was called
      expect(GraphManager.getUserAsync).toHaveBeenCalled();

      // Check if setUser was called with correct user data
      expect(mockSetUser).toHaveBeenCalledWith({
        userLoading: false,
        id: mockUser.id,
        userFirstName: mockUser.userFirstName,
        userFullName: mockUser.userFullName,
        userEmail: mockUser.userEmail,
        userTimeZone: mockUser.userTimeZone,
        userPhoto: mockUser.userPhoto,
      });
    });
  });

  it("handles sign-in error correctly", async () => {
    // Mock failed sign-in
    const mockError = new Error("Sign-in failed");
    mockSignIn.mockRejectedValueOnce(mockError);

    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <SignInScreen />
        </UserContext.Provider>
      </AuthContext.Provider>
    );

    // Find and press the sign-in button
    const signInButton = getByTestId("sign-in-button");
    fireEvent.press(signInButton);

    // Wait for async functions to resolve
    await waitFor(() => {
      // Check if console.error was called with the error
      expect(console.error).toHaveBeenCalledWith(
        "Error durante el inicio de sesión:",
        mockError
      );

      // Check if Alert.alert was called with correct parameters
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error de Inicio de Sesión",
        "Sign-in failed"
      );

      // Check setUser was not called
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  it("handles missing user data correctly", async () => {
    // Mock successful sign-in but no user data
    mockSignIn.mockResolvedValueOnce();
    GraphManager.getUserAsync.mockResolvedValueOnce(null);

    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <SignInScreen />
        </UserContext.Provider>
      </AuthContext.Provider>
    );

    // Find and press the sign-in button
    const signInButton = getByTestId("sign-in-button");
    fireEvent.press(signInButton);

    // Wait for async functions to resolve
    await waitFor(() => {
      // Check if console.error was called
      expect(console.error).toHaveBeenCalled();

      // Check if Alert.alert was called with correct error message
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error de Inicio de Sesión",
        "No se pudo obtener la información del usuario."
      );

      // Check setUser was not called
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  it("handles missing user photo correctly", async () => {
    // Mock successful sign-in with user missing photo
    const userWithoutPhoto = { ...mockUser, userPhoto: null };
    mockSignIn.mockResolvedValueOnce();
    GraphManager.getUserAsync.mockResolvedValueOnce(userWithoutPhoto);

    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <SignInScreen />
        </UserContext.Provider>
      </AuthContext.Provider>
    );

    // Find and press the sign-in button
    const signInButton = getByTestId("sign-in-button");
    fireEvent.press(signInButton);

    // Wait for async functions to resolve
    await waitFor(() => {
      // Verify setUser was called with default profile image
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userPhoto: "mocked-profile-image",
        })
      );
    });
  });
});
