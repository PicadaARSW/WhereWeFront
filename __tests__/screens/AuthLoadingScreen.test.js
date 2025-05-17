import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text, Image, ActivityIndicator, Animated } from "react-native";
import AuthLoadingScreen from "../../screens/AuthLoadingScreen";

// Mock assets
jest.mock("../../assets/icon.png", () => "mocked-app-icon");

describe("AuthLoadingScreen", () => {
  it("file exists", () => {
    const fs = require("fs");
    const path = "./screens/AuthLoadingScreen.jsx";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be imported without errors", () => {
    expect(() => {
      require("../../screens/AuthLoadingScreen");
    }).not.toThrow();
  });

  it("renders correctly with all UI elements", () => {
    const { getByTestId, getByText } = render(<AuthLoadingScreen />);

    // Check main container
    const screen = getByTestId("auth-loading-screen");
    expect(screen).toBeTruthy();

    // Check header
    const header = getByTestId("header-container");
    expect(header).toBeTruthy();

    // Check title text
    expect(getByText("Where We!")).toBeTruthy();

    // Check animated container
    const animatedContainer = getByTestId("animated-container");
    expect(animatedContainer).toBeTruthy();

    // Check app logo
    const appLogo = getByTestId("app-logo");
    expect(appLogo).toBeTruthy();

    // Check loading indicator
    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeTruthy();

    // Check status text
    expect(getByText("Iniciando sesión...")).toBeTruthy();
  });
});
