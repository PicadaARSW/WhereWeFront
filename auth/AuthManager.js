import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import moment from "moment";
import { AuthConfig } from "./AuthConfig";

// Configuración estática de los endpoints de Azure AD
const discovery = {
  authorizationEndpoint:
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
};

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
console.log("Default redirect URI:", redirectUri);

export class AuthManager {
  // Autenticación para la API personalizada
  static signInAsync = async () => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: AuthConfig.appId,
        scopes: AuthConfig.apiScopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { prompt: "select_account" },
      });

      const result = await authRequest.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        console.error("No authorization code received (API).", result);
        throw new Error("Authentication failed. No code received.");
      }

      console.log("Authorization Code (API):", result.params.code);

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: AuthConfig.appId,
          code: result.params.code,
          redirectUri,
          scopes: AuthConfig.apiScopes,
          extraParams: {
            code_verifier: authRequest.codeVerifier,
          },
        },
        discovery
      );

      if (!tokenResponse?.accessToken) {
        console.error("Token exchange failed (API).", tokenResponse);
        throw new Error("Failed to obtain API access token.");
      }

      const expirationDate = moment()
        .add(tokenResponse.expiresIn, "seconds")
        .toISOString();

      console.log("API Access Token:", tokenResponse.accessToken);

      await AsyncStorage.setItem("apiToken", tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await AsyncStorage.setItem(
          "apiRefreshToken",
          tokenResponse.refreshToken
        );
      }
      await AsyncStorage.setItem("apiExpireTime", expirationDate);

      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Sign-in error (API):", error);
      throw error;
    }
  };

  // Autenticación para Microsoft Graph
  static signInGraphAsync = async () => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: AuthConfig.appId,
        scopes: AuthConfig.graphScopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { prompt: "select_account" },
      });

      const result = await authRequest.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        console.error("No authorization code received (Graph).", result);
        throw new Error(
          `Graph authentication failed: ${JSON.stringify(result)}`
        );
      }

      console.log("Authorization Code (Graph):", result.params.code);

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: AuthConfig.appId,
          code: result.params.code,
          redirectUri,
          scopes: AuthConfig.graphScopes,
          extraParams: {
            code_verifier: authRequest.codeVerifier,
          },
        },
        discovery
      );

      if (!tokenResponse?.accessToken) {
        console.error("Token exchange failed (Graph).", tokenResponse);
        throw new Error("Failed to obtain Graph access token.");
      }

      const expirationDate = moment()
        .add(tokenResponse.expiresIn, "seconds")
        .toISOString();

      console.log("Graph Access Token:", tokenResponse.accessToken);

      await AsyncStorage.setItem("graphToken", tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await AsyncStorage.setItem(
          "graphRefreshToken",
          tokenResponse.refreshToken
        );
      }
      await AsyncStorage.setItem("graphExpireTime", expirationDate);

      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Sign-in error (Graph):", error);
      throw error;
    }
  };

  static signOutAsync = async () => {
    try {
      await AsyncStorage.removeItem("apiToken");
      await AsyncStorage.removeItem("apiRefreshToken");
      await AsyncStorage.removeItem("apiExpireTime");
      await AsyncStorage.removeItem("graphToken");
      await AsyncStorage.removeItem("graphRefreshToken");
      await AsyncStorage.removeItem("graphExpireTime");
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  // Obtener token para la API personalizada
  static getAccessTokenAsync = async () => {
    try {
      const expireTime = await AsyncStorage.getItem("apiExpireTime");
      if (!expireTime) {
        console.warn("No API token found in storage.");
        return null;
      }

      const expire = moment(expireTime).subtract(5, "minutes");
      const now = moment();

      if (now.isSameOrAfter(expire)) {
        console.log("Refreshing API token");
        const refreshToken = await AsyncStorage.getItem("apiRefreshToken");
        if (!refreshToken) {
          console.warn("No refresh token available for API.");
          return null;
        }

        const refreshResult = await AuthSession.refreshAsync(
          {
            clientId: AuthConfig.appId,
            refreshToken,
            scopes: AuthConfig.apiScopes,
          },
          discovery
        );

        if (!refreshResult?.accessToken) {
          console.error("Failed to refresh API access token.", refreshResult);
          return null;
        }

        const newExpirationDate = moment()
          .add(refreshResult.expiresIn, "seconds")
          .toISOString();

        await AsyncStorage.setItem("apiToken", refreshResult.accessToken);
        if (refreshResult.refreshToken) {
          await AsyncStorage.setItem(
            "apiRefreshToken",
            refreshResult.refreshToken
          );
        }
        await AsyncStorage.setItem("apiExpireTime", newExpirationDate);

        return refreshResult.accessToken;
      }

      const token = await AsyncStorage.getItem("apiToken");
      if (!token) {
        console.warn("API token not found in storage.");
        return null;
      }

      return token;
    } catch (error) {
      console.error("Get API token error:", error);
      return null;
    }
  };

  // Obtener token para Microsoft Graph
  static getGraphAccessTokenAsync = async () => {
    try {
      const expireTime = await AsyncStorage.getItem("graphExpireTime");
      if (!expireTime) {
        console.warn("No Graph token found in storage.");
        return null;
      }

      const expire = moment(expireTime).subtract(5, "minutes");
      const now = moment();

      if (now.isSameOrAfter(expire)) {
        console.log("Refreshing Graph token");
        const refreshToken = await AsyncStorage.getItem("graphRefreshToken");
        if (!refreshToken) {
          console.warn("No refresh token available for Graph.");
          return null;
        }

        const refreshResult = await AuthSession.refreshAsync(
          {
            clientId: AuthConfig.appId,
            refreshToken,
            scopes: AuthConfig.graphScopes,
          },
          discovery
        );

        if (!refreshResult?.accessToken) {
          console.error("Failed to refresh Graph access token.", refreshResult);
          return null;
        }

        const newExpirationDate = moment()
          .add(refreshResult.expiresIn, "seconds")
          .toISOString();

        await AsyncStorage.setItem("graphToken", refreshResult.accessToken);
        if (refreshResult.refreshToken) {
          await AsyncStorage.setItem(
            "graphRefreshToken",
            refreshResult.refreshToken
          );
        }
        await AsyncStorage.setItem("graphExpireTime", newExpirationDate);

        return refreshResult.accessToken;
      }

      const token = await AsyncStorage.getItem("graphToken");
      if (!token) {
        console.warn("Graph token not found in storage.");
        return null;
      }

      return token;
    } catch (error) {
      console.error("Get Graph token error:", error);
      return null;
    }
  };
}
