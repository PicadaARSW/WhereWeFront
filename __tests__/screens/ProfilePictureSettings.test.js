import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfilePictureSettings from "../../screens/ProfilePictureSettings";
import { UserContext } from "../../UserContext";
import { ApiClient } from "../../api/ApiClient";

// Mock the ApiClient
jest.mock("../../api/ApiClient", () => ({
  ApiClient: jest.fn(),
}));

// Mock the navigation object
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock profile pictures to ensure they exist
jest.mock("../../images/Icon1.png", () => "mock-image-1", { virtual: true });
jest.mock("../../images/Icon2.png", () => "mock-image-2", { virtual: true });
jest.mock("../../images/Icon3.png", () => "mock-image-3", { virtual: true });
jest.mock("../../images/Icon4.png", () => "mock-image-4", { virtual: true });
jest.mock("../../images/Icon5.png", () => "mock-image-5", { virtual: true });
jest.mock("../../images/Icon6.png", () => "mock-image-6", { virtual: true });
jest.mock("../../images/Icon7.png", () => "mock-image-7", { virtual: true });
jest.mock("../../images/Icon8.png", () => "mock-image-8", { virtual: true });
jest.mock("../../images/Icon9.png", () => "mock-image-9", { virtual: true });
jest.mock("../../images/Icon10.png", () => "mock-image-10", { virtual: true });

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe("ProfilePictureSettings", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation.goBack.mockClear();
  });

  it("renders correctly with profile pictures", () => {
    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId, queryAllByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Check that the container exists
    expect(getByTestId("profile-picture-settings-container")).toBeTruthy();

    // Check that the FlatList exists
    expect(getByTestId("profile-pictures-list")).toBeTruthy();

    // Check that all profile pictures are rendered (using a regex pattern to match all testIDs)
    const profilePictures = queryAllByTestId(/^profile-picture-\d+$/);
    expect(profilePictures.length).toBe(10); // There should be 10 profile pictures

    // Check that all images are rendered
    const profileImages = queryAllByTestId(/^profile-image-\d+$/);
    expect(profileImages.length).toBe(10);
  });

  it("calls updateProfilePicture when an image is pressed", async () => {
    // Mock successful API response
    const mockResponse = {
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ id: "test-user-id", userPhoto: "profile1.png" }),
    };
    ApiClient.mockResolvedValue(mockResponse);

    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Trigger image press on the first profile picture
    const firstProfilePicture = getByTestId("profile-picture-1");
    fireEvent.press(firstProfilePicture);

    // Wait for the API call to resolve
    await waitFor(() => {
      // Check that the API was called with correct parameters
      expect(ApiClient).toHaveBeenCalledWith(
        `users/api/v1/users/${mockUserContext.id}/profile-picture`,
        "PUT",
        { pictureUrl: "profile1.png" }
      );

      // Check that the user context was updated
      expect(mockUserContext.setUser).toHaveBeenCalled();

      // Check that navigation.goBack was called
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it("handles API error when updating profile picture", async () => {
    // Mock API error
    ApiClient.mockRejectedValue(new Error("API error"));

    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Trigger image press
    const firstProfilePicture = getByTestId("profile-picture-1");
    fireEvent.press(firstProfilePicture);

    // Wait for the error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error updating profile picture:",
        expect.any(Error)
      );
    });
  });

  it("handles API response not ok when updating profile picture", async () => {
    // Mock unsuccessful API response
    const mockResponse = {
      ok: false,
    };
    ApiClient.mockResolvedValue(mockResponse);

    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Trigger image press
    const firstProfilePicture = getByTestId("profile-picture-1");
    fireEvent.press(firstProfilePicture);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalled();
      // User context and navigation should not be updated
      expect(mockUserContext.setUser).not.toHaveBeenCalled();
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });

  it("selects different profile pictures correctly", async () => {
    // Mock successful API response
    const mockResponse = {
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ id: "test-user-id", userPhoto: "profile5.png" }),
    };
    ApiClient.mockResolvedValue(mockResponse);

    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Trigger press on the 5th picture
    const fifthProfilePicture = getByTestId("profile-picture-5");
    fireEvent.press(fifthProfilePicture);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        `users/api/v1/users/${mockUserContext.id}/profile-picture`,
        "PUT",
        { pictureUrl: "profile5.png" }
      );

      // Verify the user data is updated with the correct icon
      expect(mockUserContext.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userPhoto: expect.anything(), // We can't directly check the require result
        })
      );
    });
  });

  // Test edge cases
  it("properly calculates array index from picture URL", async () => {
    // Mock successful API response
    const mockResponse = {
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ id: "test-user-id", userPhoto: "profile10.png" }),
    };
    ApiClient.mockResolvedValue(mockResponse);

    // Mock user context
    const mockUserContext = {
      id: "test-user-id",
      userPhoto: require("../../images/Icon1.png"),
      setUser: jest.fn(),
    };

    // Render component with mocked context
    const { getByTestId } = render(
      <UserContext.Provider value={mockUserContext}>
        <ProfilePictureSettings navigation={mockNavigation} />
      </UserContext.Provider>
    );

    // Trigger press on the 10th picture (testing double-digit index calculation)
    const tenthProfilePicture = getByTestId("profile-picture-10");
    fireEvent.press(tenthProfilePicture);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(ApiClient).toHaveBeenCalledWith(
        `users/api/v1/users/${mockUserContext.id}/profile-picture`,
        "PUT",
        { pictureUrl: "profile10.png" }
      );

      // Verify the correct profile picture is selected (index calculation from profile10.png to array index 9)
      expect(mockUserContext.setUser).toHaveBeenCalled();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});
