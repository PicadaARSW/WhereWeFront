import React from "react";
import { render, act } from "@testing-library/react-native";
import { UserContext, UserProvider } from "../UserContext";

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
jest.spyOn(console, "log").mockImplementation(() => {});

// Mock the image imports
jest.mock("../images/no-profile-pic.png", () => "mocked-no-profile-pic");

describe("UserContext", () => {
  afterAll(() => {
    console.log = originalConsoleLog;
  });

  it("provides default user values", () => {
    let contextValues;

    const TestComponent = () => {
      contextValues = React.useContext(UserContext);
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(contextValues).toBeDefined();
    expect(contextValues.userLoading).toBe(true);
    expect(contextValues.id).toBe("");
    expect(contextValues.userFirstName).toBe("");
    expect(contextValues.userFullName).toBe("");
    expect(contextValues.userEmail).toBe("");
    expect(contextValues.userTimeZone).toBe("");
    expect(contextValues.userPhoto).toBe("mocked-no-profile-pic");
    expect(typeof contextValues.setUser).toBe("function");
  });

  it("updates user data when setUser is called", () => {
    let contextValues;

    const TestComponent = () => {
      contextValues = React.useContext(UserContext);
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const updatedUser = {
      id: "test-id",
      userLoading: false,
      userFirstName: "John",
      userFullName: "John Doe",
      userEmail: "john@example.com",
      userTimeZone: "UTC",
      userPhoto: "profile-pic-url",
    };

    act(() => {
      contextValues.setUser(updatedUser);
    });

    expect(contextValues.id).toBe("test-id");
    expect(contextValues.userLoading).toBe(false);
    expect(contextValues.userFirstName).toBe("John");
    expect(contextValues.userFullName).toBe("John Doe");
    expect(contextValues.userEmail).toBe("john@example.com");
    expect(contextValues.userTimeZone).toBe("UTC");
    expect(contextValues.userPhoto).toBe("profile-pic-url");
  });

  it("validates children prop requirements", () => {
    // Test with valid children prop
    const { unmount } = render(
      <UserProvider>
        <div>Test</div>
      </UserProvider>
    );
    unmount();

    // Here we're just testing that the prop-types validation function exists and is called
    expect(UserProvider.propTypes).toBeDefined();
    expect(UserProvider.propTypes.children).toBeDefined();
  });

  it("updates useMemo value when user state changes", () => {
    let initialContextValues;
    let updatedContextValues;

    // Component to capture context values at different times
    const TestComponent = () => {
      const context = React.useContext(UserContext);

      // Store the initial context
      if (!initialContextValues) {
        initialContextValues = { ...context };
      } else {
        // Store the updated context if it's different
        if (context.id !== initialContextValues.id) {
          updatedContextValues = { ...context };
        }
      }

      return null;
    };

    const { rerender } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // First check initial values
    expect(initialContextValues).toBeDefined();
    expect(initialContextValues.id).toBe("");

    // Update the user state
    act(() => {
      initialContextValues.setUser({
        id: "new-id",
        userLoading: false,
        userFirstName: "Updated",
        userFullName: "Updated Name",
        userEmail: "updated@example.com",
        userTimeZone: "GMT",
        userPhoto: "new-photo",
      });
    });

    // Force a rerender to capture the new context
    rerender(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Check that useMemo produced a new value with updated properties
    expect(updatedContextValues).toBeDefined();
    expect(updatedContextValues.id).toBe("new-id");
    expect(updatedContextValues.userFirstName).toBe("Updated");
    expect(updatedContextValues.userFullName).toBe("Updated Name");
    expect(updatedContextValues.userEmail).toBe("updated@example.com");
    expect(updatedContextValues.userTimeZone).toBe("GMT");
    expect(updatedContextValues.userPhoto).toBe("new-photo");
  });

  it("logs user context state changes", () => {
    console.log = jest.fn();

    let contextValues;

    const TestComponent = () => {
      contextValues = React.useContext(UserContext);
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Check that the initial state was logged
    expect(console.log).toHaveBeenCalledWith(
      "UserContext state:",
      expect.objectContaining({
        id: "",
        userLoading: true,
      })
    );

    // Update the user state
    act(() => {
      contextValues.setUser({
        id: "test-id",
        userLoading: false,
        userFirstName: "Test",
        userFullName: "Test User",
        userEmail: "test@example.com",
        userTimeZone: "UTC",
        userPhoto: "test-photo",
      });
    });

    // Check that the updated state was logged
    expect(console.log).toHaveBeenCalledWith(
      "UserContext state:",
      expect.objectContaining({
        id: "test-id",
        userLoading: false,
      })
    );
  });
});
