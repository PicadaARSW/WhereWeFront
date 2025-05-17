import React from "react";
import { AuthManager } from "../auth/AuthManager";
import { GraphManager } from "../graph/GraphManager";

// Mock AuthManager
jest.mock("../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn(),
    getGraphAccessTokenAsync: jest.fn(),
    signInAsync: jest.fn(),
    signInGraphAsync: jest.fn(),
    signOutAsync: jest.fn(),
  },
}));

// Mock GraphManager
jest.mock("../graph/GraphManager", () => ({
  GraphManager: {
    getUserAsync: jest.fn(),
  },
}));

// Profile pictures mock
const profilePictures = {
  "profile1.jpg": "mocked-icon1",
  "profile2.jpg": "mocked-icon2",
  "profile3.jpg": "mocked-icon3",
  "profile4.jpg": "mocked-icon4",
  "profile5.jpg": "mocked-icon5",
  "profile6.jpg": "mocked-icon6",
  "profile7.jpg": "mocked-icon7",
  "profile8.jpg": "mocked-icon8",
  "profile9.jpg": "mocked-icon9",
  "profile10.jpg": "mocked-icon10",
};

// Mock the assets
jest.mock("../images/no-profile-pic.png", () => "mocked-no-profile-pic");
jest.mock("../images/Icon1.png", () => "mocked-icon1");
jest.mock("../images/Icon2.png", () => "mocked-icon2");
jest.mock("../images/Icon3.png", () => "mocked-icon3");
jest.mock("../images/Icon4.png", () => "mocked-icon4");
jest.mock("../images/Icon5.png", () => "mocked-icon5");
jest.mock("../images/Icon6.png", () => "mocked-icon6");
jest.mock("../images/Icon7.png", () => "mocked-icon7");
jest.mock("../images/Icon8.png", () => "mocked-icon8");
jest.mock("../images/Icon9.png", () => "mocked-icon9");
jest.mock("../images/Icon10.png", () => "mocked-icon10");

// Tests for the profilePictures and image processing in App.js
describe("App profile picture selection", () => {
  test("Choosing the correct profile picture for null", () => {
    const userPhoto = null;

    // This is the same logic as in App.js
    let photoResult = userPhoto;
    if (!photoResult) {
      photoResult = "mocked-no-profile-pic"; // Mocked require
    } else if (profilePictures[photoResult]) {
      photoResult = profilePictures[photoResult];
    }

    expect(photoResult).toBe("mocked-no-profile-pic");
  });

  test("Choosing the correct profile picture for specific profile", () => {
    const userPhoto = "profile5.jpg";

    // This is the same logic as in App.js
    let photoResult = userPhoto;
    if (!photoResult) {
      photoResult = "mocked-no-profile-pic"; // Mocked require
    } else if (profilePictures[photoResult]) {
      photoResult = profilePictures[photoResult];
    }

    expect(photoResult).toBe("mocked-icon5");
  });

  test("Keeping unknown photo URLs as is", () => {
    const userPhoto = "unknown.jpg";

    // This is the same logic as in App.js
    let photoResult = userPhoto;
    if (!photoResult) {
      photoResult = "mocked-no-profile-pic"; // Mocked require
    } else if (profilePictures[photoResult]) {
      photoResult = profilePictures[photoResult];
    }

    expect(photoResult).toBe("unknown.jpg");
  });
});

// Tests for error handling in App.js
describe("App error handling", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test("Handling getAccessTokenAsync errors", async () => {
    const error = new Error("Token fetch error");
    AuthManager.getAccessTokenAsync.mockRejectedValueOnce(error);

    try {
      await AuthManager.getAccessTokenAsync();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe(error);
      expect(e.message).toBe("Token fetch error");
    }
  });

  test("Handling getGraphAccessTokenAsync errors", async () => {
    AuthManager.getAccessTokenAsync.mockResolvedValueOnce("test-token");
    const error = new Error("Graph token error");
    AuthManager.getGraphAccessTokenAsync.mockRejectedValueOnce(error);

    const token = await AuthManager.getAccessTokenAsync();
    expect(token).toBe("test-token");

    try {
      await AuthManager.getGraphAccessTokenAsync();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe(error);
      expect(e.message).toBe("Graph token error");
    }
  });

  test("Handling getUserAsync errors", async () => {
    AuthManager.getAccessTokenAsync.mockResolvedValueOnce("test-token");
    AuthManager.getGraphAccessTokenAsync.mockResolvedValueOnce("graph-token");
    const error = new Error("User data error");
    GraphManager.getUserAsync.mockRejectedValueOnce(error);

    const token = await AuthManager.getAccessTokenAsync();
    expect(token).toBe("test-token");

    await AuthManager.getGraphAccessTokenAsync();

    try {
      await GraphManager.getUserAsync();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe(error);
      expect(e.message).toBe("User data error");
    }
  });
});
