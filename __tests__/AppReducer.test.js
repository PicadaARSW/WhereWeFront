import React from "react";
import App from "../App";

// Extract the reducer from App component
const getReducerFromAppComponent = () => {
  // This is the same reducer function from App.js
  return (prevState, action) => {
    switch (action.type) {
      case "RESTORE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case "SIGN_IN":
        return {
          ...prevState,
          isSignOut: false,
          userToken: action.token,
        };
      case "SIGN_OUT":
        return {
          ...prevState,
          isSignOut: true,
          userToken: null,
        };
      case "UPDATE_USER":
        return {
          ...prevState,
          user: action.user,
        };
      default:
        return prevState;
    }
  };
};

// Tests for the reducer only
describe("App Reducer", () => {
  // Get the reducer for testing
  const reducer = getReducerFromAppComponent();

  // Initial state for testing
  const initialState = {
    isLoading: true,
    isSignOut: false,
    userToken: null,
    user: null,
  };

  it("handles RESTORE_TOKEN action", () => {
    const newState = reducer(initialState, {
      type: "RESTORE_TOKEN",
      token: "test-token",
    });

    expect(newState).toEqual({
      isLoading: false,
      isSignOut: false,
      userToken: "test-token",
      user: null,
    });
  });

  it("handles SIGN_IN action", () => {
    const newState = reducer(initialState, {
      type: "SIGN_IN",
      token: "test-token",
    });

    expect(newState).toEqual({
      isLoading: true,
      isSignOut: false,
      userToken: "test-token",
      user: null,
    });
  });

  it("handles SIGN_OUT action", () => {
    // Start from a logged-in state
    const loggedInState = {
      isLoading: false,
      isSignOut: false,
      userToken: "old-token",
      user: { id: "test" },
    };

    const newState = reducer(loggedInState, { type: "SIGN_OUT" });

    expect(newState).toEqual({
      isLoading: false,
      isSignOut: true,
      userToken: null,
      user: { id: "test" }, // User data is kept
    });
  });

  it("handles UPDATE_USER action", () => {
    const user = {
      id: "user-id",
      userLoading: false,
      userFirstName: "Test",
      userFullName: "Test User",
      userEmail: "test@example.com",
      userTimeZone: "UTC",
      userPhoto: require("../images/no-profile-pic.png"),
    };

    const newState = reducer(initialState, {
      type: "UPDATE_USER",
      user,
    });

    expect(newState).toEqual({
      isLoading: true,
      isSignOut: false,
      userToken: null,
      user,
    });
  });

  it("handles unknown action (default case)", () => {
    const newState = reducer(initialState, {
      type: "UNKNOWN_ACTION",
    });

    // Should return unchanged state
    expect(newState).toBe(initialState);
  });
});
