import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { UserContext } from "../../UserContext";

// Importar el componente real
import GroupsScreen from "../../screens/GroupsScreen";
import { ApiClient } from "../../api/ApiClient";

// Mock solo de las dependencias, no del componente completo
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

// Mock de useFocusEffect - usando la sintaxis correcta para evitar referencias a variables externas
jest.mock("@react-navigation/native", () => {
  const mockUseFocusEffect = (callback) => {
    const { useEffect } = require("react");
    useEffect(() => {
      callback();
    }, [callback]);
  };

  return {
    useFocusEffect: mockUseFocusEffect,
  };
});

// Mock del componente GroupItem
jest.mock("../../components/GroupItem", () => {
  const mockGroupItem = "div";
  return mockGroupItem;
});

// Mock de los estilos
jest.mock("../../styles/GroupScreenStyles", () => ({
  container: {},
  header: {},
  alertMessage: {},
}));

// Mock de ApiClient
jest.mock("../../api/ApiClient");

const defaultUserId = "test-user-123";

// Wrapper component that provides UserContext
const renderWithUserContext = (
  component,
  contextValue = { id: defaultUserId }
) => {
  return render(
    <UserContext.Provider value={contextValue}>
      {component}
    </UserContext.Provider>
  );
};

describe("GroupsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restablecer el mock de console.log y console.error
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", async () => {
    // Set up the mock to delay response
    ApiClient.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve([]),
              }),
            100
          )
        )
    );

    const { getByText, queryByText } = renderWithUserContext(<GroupsScreen />);

    // Header should be visible
    expect(getByText("Mis Grupos")).toBeTruthy();

    // Wait for loading to finish
    await waitFor(() =>
      expect(queryByText("No tienes grupos asignados.")).toBeTruthy()
    );
  });

  it("fetches and displays groups", async () => {
    // Mock groups data
    const mockGroups = [
      { id: "1", name: "Group 1" },
      { id: "2", name: "Group 2" },
      { id: "3", name: "Group 3" },
    ];

    // Set up successful API response
    ApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGroups),
    });

    const { queryByText } = renderWithUserContext(<GroupsScreen />);

    // Wait for loading to finish and groups to be rendered
    await waitFor(() => {
      // No empty message should be shown
      expect(queryByText("No tienes grupos asignados.")).toBeFalsy();
    });

    // Probar que se llama a console.log con los datos
    expect(console.log).toHaveBeenCalledWith(mockGroups);

    // Verify API was called with correct user ID
    expect(ApiClient).toHaveBeenCalledWith(
      `groups/api/v1/groups/user/${defaultUserId}`
    );
  });

  it("handles API error response", async () => {
    // Mock unsuccessful API response
    ApiClient.mockResolvedValueOnce({
      ok: false,
    });

    const { getByText } = renderWithUserContext(<GroupsScreen />);

    // Wait for loading to finish
    await waitFor(() => {
      // Empty message should be shown
      expect(getByText("No tienes grupos asignados.")).toBeTruthy();
    });
  });

  it("handles exception during API call", async () => {
    // Mock API throwing an exception
    ApiClient.mockImplementationOnce(() => {
      throw new Error("Network error");
    });

    const { getByText } = renderWithUserContext(<GroupsScreen />);

    // Wait for loading to finish
    await waitFor(() => {
      // Empty message should be shown
      expect(getByText("No tienes grupos asignados.")).toBeTruthy();
    });

    // Console error should have been called
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching groups:",
      expect.any(Error)
    );
  });

  it("refetches groups when user ID changes", async () => {
    // First render with initial user ID
    ApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: "1", name: "Group 1" }]),
    });

    const { rerender } = renderWithUserContext(<GroupsScreen />);

    // Wait for first API call to complete
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        `groups/api/v1/groups/user/${defaultUserId}`
      );
    });

    // Setup mock for second API call with new user ID
    const newUserId = "new-user-456";
    ApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: "2", name: "New Group" }]),
    });

    // Rerender with new user ID
    rerender(
      <UserContext.Provider value={{ id: newUserId }}>
        <GroupsScreen />
      </UserContext.Provider>
    );

    // Wait for second API call with new ID
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        `groups/api/v1/groups/user/${newUserId}`
      );
    });
  });

  it("renders no groups message when API returns empty array", async () => {
    // Mock empty groups array
    ApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { getByText } = renderWithUserContext(<GroupsScreen />);

    // Wait for loading to finish
    await waitFor(() => {
      // Empty message should be shown
      expect(getByText("No tienes grupos asignados.")).toBeTruthy();
    });
  });

  it("tests the fetchGroups function callback", async () => {
    // Probamos que la API se llama correctamente, lo que indica que fetchGroups se ejecutó
    ApiClient.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderWithUserContext(<GroupsScreen />);

    // Verificar que la API fue llamada, lo que indica que fetchGroups se ejecutó correctamente
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        `groups/api/v1/groups/user/${defaultUserId}`
      );
    });
  });
});
