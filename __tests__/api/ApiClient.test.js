import { ApiClient } from "../../api/ApiClient";
import { AuthManager } from "../../auth/AuthManager";

// Mock fetch globally
global.fetch = jest.fn();

// Mock AuthManager
jest.mock("../../auth/AuthManager", () => ({
  AuthManager: {
    getAccessTokenAsync: jest.fn(),
  },
}));

describe("ApiClient", () => {
  const mockToken = "mock-api-token";
  const mockResponseData = { success: true, data: "test data" };

  beforeEach(() => {
    jest.clearAllMocks();
    AuthManager.getAccessTokenAsync.mockResolvedValue(mockToken);

    // Setup fetch mock to return successful response
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponseData),
    });

    // Mock console.log
    console.log = jest.fn();
  });

  it("calls the correct endpoint with authorization header", async () => {
    await ApiClient("test/endpoint");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://wherewe-apim.azure-api.net/test/endpoint",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
  });

  it("uses POST method and body when provided", async () => {
    const testBody = { test: "data" };

    await ApiClient("test/endpoint", "POST", testBody);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://wherewe-apim.azure-api.net/test/endpoint",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify(testBody),
      })
    );
  });

  it("returns undefined when token cannot be obtained", async () => {
    AuthManager.getAccessTokenAsync.mockResolvedValue(null);

    const result = await ApiClient("test/endpoint");
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalled();
  });

  it("handles response not ok", async () => {
    const errorStatus = 401;
    global.fetch.mockResolvedValue({
      ok: false,
      status: errorStatus,
    });

    const result = await ApiClient("test/endpoint");
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalled();
  });

  it("handles errors from fetch", async () => {
    const testError = new Error("Network error");
    global.fetch.mockRejectedValue(testError);

    const result = await ApiClient("test/endpoint");
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("Error en ApiClient:", testError);
  });
});
