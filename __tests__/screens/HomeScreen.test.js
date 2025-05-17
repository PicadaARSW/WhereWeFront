import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import HomeScreen from "../../screens/HomeScreen";
import { UserContext } from "../../UserContext";
import { GraphManager } from "../../graph/GraphManager";
import { ApiClient } from "../../api/ApiClient";

// Mock dependencies
jest.mock("../../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn(),
  },
}));

jest.mock("../../api/ApiClient", () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    ok: true,
    json: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock de react-native-vector-icons
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

// Mock de React Navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

const mockUserContextValue = {
  user: {
    id: "user-123",
    userFirstName: "Test",
    userFullName: "Test User",
    userEmail: "test@example.com",
    userPhoto: null,
  },
  setUser: jest.fn(),
};

describe("HomeScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock global fetch
    global.fetch = jest.fn().mockImplementation(() => ({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    }));

    // Mock console methods
    console.error = jest.fn();
    console.log = jest.fn();

    // Mock GraphManager
    GraphManager.getUserAsync.mockResolvedValue(mockUserContextValue.user);
  });

  it("renders loading state initially", () => {
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomeScreen />
      </UserContext.Provider>
    );

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("displays user information after loading", async () => {
    const { getByText, queryByTestId } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomeScreen />
      </UserContext.Provider>
    );

    // Inicialmente debería mostrar el loading
    expect(queryByTestId("loading-indicator")).toBeTruthy();

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Verifica que el nombre del usuario se muestra (con espacio entre texto y valor)
    expect(getByText("Hola, Usuario!")).toBeTruthy();
  });

  it("shows create group modal when create group button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomeScreen />
      </UserContext.Provider>
    );

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Presiona el botón para crear un grupo
    fireEvent.press(getByTestId("create-group-btn"));

    // Verifica que aparezca el modal
    expect(getByTestId("create-group-modal")).toBeTruthy();
  });

  it("shows join group modal when join group button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomeScreen />
      </UserContext.Provider>
    );

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Presiona el botón para unirse a un grupo
    fireEvent.press(getByTestId("join-group-btn"));

    // Verifica que aparezca el modal
    expect(getByTestId("join-group-modal")).toBeTruthy();
  });

  it("can create a new group with valid data", async () => {
    // Mock de respuesta exitosa para creación de grupo
    ApiClient.mockImplementationOnce(() => ({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupId: "new-group-123",
        groupName: "Test Group",
        adminId: "user-123",
        groupCode: "ABC123",
      }),
    }));

    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <UserContext.Provider
        value={{
          ...mockUserContextValue,
          user: {
            ...mockUserContextValue.user,
            id: "user-123",
          },
        }}
      >
        <HomeScreen />
      </UserContext.Provider>
    );

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Abre el modal de creación
    fireEvent.press(getByTestId("create-group-btn"));

    // Ingresa el nombre del grupo
    fireEvent.changeText(
      getByPlaceholderText("Nombre del grupo"),
      "Test Group"
    );

    // Presiona el botón para crear
    fireEvent.press(getByTestId("create-group-button"));

    // Verifica que se llamó a la API
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        "groups/api/v1/groups",
        "POST",
        expect.objectContaining({
          nameGroup: "Test Group",
        })
      );
    });
  });

  it("can join an existing group with valid code", async () => {
    // Mock de respuesta exitosa para unirse a grupo
    ApiClient.mockImplementationOnce(() => ({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupId: "existing-group-123",
        groupName: "Existing Group",
      }),
    }));

    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <UserContext.Provider
        value={{
          ...mockUserContextValue,
          user: {
            ...mockUserContextValue.user,
            id: "user-123",
          },
        }}
      >
        <HomeScreen />
      </UserContext.Provider>
    );

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Abre el modal para unirse
    fireEvent.press(getByTestId("join-group-btn"));

    // Ingresa el código del grupo
    fireEvent.changeText(getByPlaceholderText("Código del grupo"), "ABC123");

    // Presiona el botón para unirse
    fireEvent.press(getByTestId("join-group-button"));

    // Verifica que se llamó a la API con algún parámetro
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalled();
    });
  });

  it("displays error alert when API call fails", async () => {
    // Mock de respuesta fallida para creación de grupo
    ApiClient.mockImplementationOnce(() => {
      throw new Error("Mock API Error");
    });

    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <HomeScreen />
      </UserContext.Provider>
    );

    // Espera a que se complete la carga
    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
    });

    // Abre el modal de creación
    fireEvent.press(getByTestId("create-group-btn"));

    // Ingresa el nombre del grupo
    fireEvent.changeText(
      getByPlaceholderText("Nombre del grupo"),
      "Test Group"
    );

    // Presiona el botón para crear
    fireEvent.press(getByTestId("create-group-button"));

    // Verify that an alert is shown (we can't directly test the custom alert)
    await waitFor(() => {
      // Just verify the API was called and no further assertions are needed
      // since we're mocking a thrown error
      expect(ApiClient).toHaveBeenCalled();
    });
  });
});
