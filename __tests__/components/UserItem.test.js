import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import UserItem from "../../components/UserItem";
import { UserContext } from "../../UserContext";
import { ApiClient } from "../../api/ApiClient";

// Mock the ApiClient
jest.mock("../../api/ApiClient");

describe("UserItem Component", () => {
  const mockUser = {
    id: "123",
    userFullName: "Test User",
    userEmail: "test@example.com",
  };

  const mockGroupId = "group123";
  const mockOnExpel = jest.fn();
  const mockContextValue = { id: "admin123" };

  beforeEach(() => {
    jest.clearAllMocks();
    ApiClient.mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <UserContext.Provider value={mockContextValue}>
        <UserItem
          user={mockUser}
          isAdmin={true}
          groupId={mockGroupId}
          onExpel={mockOnExpel}
          {...props}
        />
      </UserContext.Provider>
    );
  };

  it("renders user information correctly", () => {
    const { getByText } = renderComponent();
    expect(getByText(mockUser.userFullName)).toBeTruthy();
    expect(getByText(mockUser.userEmail)).toBeTruthy();
  });

  it("shows expel button when user is admin and not viewing their own profile", () => {
    const { getByRole } = renderComponent();
    expect(getByRole("button")).toBeTruthy();
  });

  it("hides expel button when user is not admin", () => {
    const { queryByRole } = renderComponent({ isAdmin: false });
    expect(queryByRole("button")).toBeNull();
  });

  it("shows confirmation alert when expel button is pressed", () => {
    const { getByRole, getByText } = renderComponent();
    fireEvent.press(getByRole("button"));
    expect(getByText(/¿Estás seguro/)).toBeTruthy();
  });

  it("calls API and onExpel when expulsion is confirmed", async () => {
    ApiClient.mockResolvedValue({ ok: true });

    const { getByRole, getByText } = renderComponent();

    fireEvent.press(getByRole("button"));
    fireEvent.press(getByText("Expulsar"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ApiClient).toHaveBeenCalledWith(
      `groups/api/v1/groups/expel/${mockGroupId}/${mockUser.id}/${mockContextValue.id}`,
      "DELETE"
    );
    expect(mockOnExpel).toHaveBeenCalled();
  });

  it("handles API failure when expelling user", async () => {
    // Mock API failure
    ApiClient.mockResolvedValue({ ok: false });

    const { getByRole, getByText } = renderComponent();

    // Trigger expel flow
    fireEvent.press(getByRole("button"));
    fireEvent.press(getByText("Expulsar"));

    // Wait for promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check that API was called but onExpel wasn't
    expect(ApiClient).toHaveBeenCalled();
    expect(mockOnExpel).not.toHaveBeenCalled();
  });

  it("handles API errors when expelling user", async () => {
    // Mock API throwing an error
    ApiClient.mockRejectedValue(new Error("Network error"));

    const { getByRole, getByText } = renderComponent();

    // Trigger expel flow
    fireEvent.press(getByRole("button"));
    fireEvent.press(getByText("Expulsar"));

    // Wait for promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check that API was called but onExpel wasn't
    expect(ApiClient).toHaveBeenCalled();
    expect(mockOnExpel).not.toHaveBeenCalled();
  });

  it("hides alert when cancel is pressed", () => {
    const { getByRole, getByText, queryByText } = renderComponent();

    // Show the alert
    fireEvent.press(getByRole("button"));
    expect(getByText(/¿Estás seguro/)).toBeTruthy();

    // Press cancel
    fireEvent.press(getByText("Cancelar"));

    // Alert should be hidden (async behavior mocked by the test library)
    expect(queryByText(/¿Estás seguro/)).toBeNull();
  });

  it("hides expel button when viewing own profile", () => {
    // Use a user that matches the context ID (same user)
    const selfUser = {
      id: "admin123", // Same as the context ID
      userFullName: "Self User",
      userEmail: "self@example.com",
    };

    const { queryByRole } = renderComponent({ user: selfUser });
    expect(queryByRole("button")).toBeNull();
  });
});
