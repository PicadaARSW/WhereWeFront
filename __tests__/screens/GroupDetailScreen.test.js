import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import GroupDetailScreen from "../../screens/GroupDetailScreen";
import { UserContext } from "../../UserContext";
import { ApiClient } from "../../api/ApiClient";
import * as Location from "expo-location";

// Mock navigation hook
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => {
  return {
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

// Mock route params
const mockRoute = {
  params: {
    groupId: "test-group-id",
  },
};

// Mock UserContext
const mockUser = {
  id: "test-user-id",
  userFullName: "Test User",
};

// Mock ApiClient
jest.mock("../../api/ApiClient", () => ({
  ApiClient: jest.fn(),
}));

// Mock Location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
}));

describe("GroupDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("file exists", () => {
    const fs = require("fs");
    const path = "./screens/GroupDetailScreen.jsx";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be required without errors", () => {
    expect(() => {
      require("../../screens/GroupDetailScreen");
    }).not.toThrow();
  });

  it("renders loading state initially", () => {
    // Mock initial API response
    ApiClient.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    const { getByTestId } = render(
      <UserContext.Provider value={mockUser}>
        <GroupDetailScreen route={mockRoute} />
      </UserContext.Provider>
    );

    // Test that ActivityIndicator is displayed during loading
    expect(() => getByTestId("loading-indicator")).not.toThrow();
  });

  it("requests location permissions on mount", async () => {
    // Mock group data
    const mockGroupData = {
      nameGroup: "Test Group",
      code: "ABC123",
      admin: "admin-user-id",
      members: ["test-user-id"],
      nextCodeUpdate: new Date(Date.now() + 3600000).toISOString(),
    };

    ApiClient.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGroupData),
        ok: true,
      })
    );

    render(
      <UserContext.Provider value={mockUser}>
        <GroupDetailScreen route={mockRoute} />
      </UserContext.Provider>
    );

    // Verify location permissions were requested
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("navigates to map screen when map button is pressed", async () => {
    // Reset mocks before test
    mockNavigate.mockReset();

    // Mock group data
    const mockGroupData = {
      nameGroup: "Test Group",
      code: "ABC123",
      admin: "admin-user-id",
      members: ["test-user-id"],
      nextCodeUpdate: new Date(Date.now() + 3600000).toISOString(),
    };

    // Mock admin data
    const mockAdminData = {
      userFullName: "Admin User",
    };

    // Mock member data
    const mockMemberData = {
      id: "test-user-id",
      userFullName: "Test User",
    };

    // Setup API responses
    ApiClient.mockImplementation((url) => {
      if (url.includes("groups/api/v1/groups/test-group-id")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockGroupData),
          ok: true,
        });
      } else if (url.includes("users/api/v1/users/admin-user-id")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockAdminData),
          ok: true,
        });
      } else if (url.includes("users/api/v1/users/test-user-id")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockMemberData),
          ok: true,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      });
    });

    const { findByText } = render(
      <UserContext.Provider value={mockUser}>
        <GroupDetailScreen route={mockRoute} />
      </UserContext.Provider>
    );

    // Wait for the button to render and click it
    const mapButton = await findByText("Ver mapa");
    fireEvent.press(mapButton);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("GroupMapScreen", {
      groupId: "test-group-id",
    });
  });
});
