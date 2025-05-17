import { GraphAuthProvider } from "../../graph/GraphAuthProvider";
import { AuthManager } from "../../auth/AuthManager";

// Mock AuthManager
jest.mock("../../auth/AuthManager", () => ({
  AuthManager: {
    getGraphAccessTokenAsync: jest.fn(),
  },
}));

describe("GraphAuthProvider", () => {
  let graphAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    graphAuthProvider = new GraphAuthProvider();
  });

  it("should return the token from AuthManager", async () => {
    const mockToken = "mock-graph-token";
    AuthManager.getGraphAccessTokenAsync.mockResolvedValue(mockToken);

    const result = await graphAuthProvider.getAccessToken();

    expect(AuthManager.getGraphAccessTokenAsync).toHaveBeenCalled();
    expect(result).toBe(mockToken);
  });

  it("should return empty string when token is null", async () => {
    AuthManager.getGraphAccessTokenAsync.mockResolvedValue(null);

    const result = await graphAuthProvider.getAccessToken();

    expect(AuthManager.getGraphAccessTokenAsync).toHaveBeenCalled();
    expect(result).toBe("");
  });

  it("should return empty string when token is undefined", async () => {
    AuthManager.getGraphAccessTokenAsync.mockResolvedValue(undefined);

    const result = await graphAuthProvider.getAccessToken();

    expect(AuthManager.getGraphAccessTokenAsync).toHaveBeenCalled();
    expect(result).toBe("");
  });
});
