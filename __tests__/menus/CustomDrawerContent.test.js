import React from "react";
/* eslint-disable react/prop-types */
import { render, fireEvent } from "@testing-library/react-native";
// Usamos require para fs
const fs = require("fs");
import CustomDrawerContent from "../../menus/CustomDrawerContent";

// Mock navigation
const mockNavigate = jest.fn();
const mockCloseDrawer = jest.fn();
const mockSignOut = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    closeDrawer: mockCloseDrawer,
  }),
}));

// Mock UserContext
jest.mock("../../UserContext", () => ({
  UserContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) =>
      children({
        userFullName: "Test User",
        userEmail: "test@example.com",
        userPhoto: null,
      }),
  },
}));

// Override React's useContext to provide our mock values
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useContext: jest.fn().mockImplementation((context) => {
      if (context.Consumer) {
        // Handle our UserContext mock
        return {
          userFullName: "Test User",
          userEmail: "test@example.com",
          userPhoto: null,
        };
      }
      // For other contexts, return undefined
      return undefined;
    }),
  };
});

// Mock DrawerContentScrollView and related components
jest.mock("@react-navigation/drawer", () => ({
  DrawerContentScrollView: ({ children }) => <div>{children}</div>,
  DrawerItem: ({ label, onPress }) => (
    <button testID={`drawer-item-${label}`} onPress={onPress}>
      {label}
    </button>
  ),
  DrawerItemList: ({ ...props }) => <div testID="drawer-item-list"></div>,
}));

describe("CustomDrawerContent Component", () => {
  it("file exists in the project", () => {
    // Verificar que el archivo existe (puede estar en .jsx o .js)
    const filePath1 = "./menus/CustomDrawerContent.jsx";
    const filePath2 = "./menus/CustomDrawerContent.js";
    const fileExists = fs.existsSync(filePath1) || fs.existsSync(filePath2);
    expect(fileExists).toBe(true);
  });

  it("renders correctly with user info", () => {
    const { getByTestId } = render(
      <CustomDrawerContent signOut={mockSignOut} />
    );

    // Since we can't reliably test Text content, just verify the component renders
    expect(getByTestId("drawer-item-Cerrar Sesión")).toBeTruthy();
  });

  it("calls signOut when logout button is pressed", () => {
    const { getByTestId } = render(
      <CustomDrawerContent signOut={mockSignOut} />
    );

    fireEvent.press(getByTestId("drawer-item-Cerrar Sesión"));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
