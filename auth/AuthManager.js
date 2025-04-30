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
  // Tipos de autenticación soportados
  static AUTH_TYPES = {
    API: "api",
    GRAPH: "graph",
  };

  // Función genérica para autenticación
  static signInAsync = async (authType) => {
    const isGraph = authType === AuthManager.AUTH_TYPES.GRAPH;
    const scopes = isGraph ? AuthConfig.graphScopes : AuthConfig.apiScopes;
    const tokenKey = isGraph ? "graphToken" : "apiToken";
    const refreshTokenKey = isGraph ? "graphRefreshToken" : "apiRefreshToken";
    const expireTimeKey = isGraph ? "graphExpireTime" : "apiExpireTime";
    const logPrefix = isGraph ? "Graph" : "API";

    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: AuthConfig.appId,
        scopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { prompt: "select_account" },
      });

      const result = await authRequest.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        console.error(`No authorization code received (${logPrefix}).`, result);
        throw new Error(
          `${logPrefix} authentication failed: ${JSON.stringify(result)}`
        );
      }

      console.log(`Authorization Code (${logPrefix}):`, result.params.code);

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: AuthConfig.appId,
          code: result.params.code,
          redirectUri,
          scopes,
          extraParams: {
            code_verifier: authRequest.codeVerifier,
          },
        },
        discovery
      );

      if (!tokenResponse?.accessToken) {
        console.error(`Token exchange failed (${logPrefix}).`, tokenResponse);
        throw new Error(`Failed to obtain ${logPrefix} access token.`);
      }

      const expirationDate = moment()
        .add(tokenResponse.expiresIn, "seconds")
        .toISOString();

      console.log(`${logPrefix} Access Token:`, tokenResponse.accessToken);

      await AsyncStorage.setItem(tokenKey, tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await AsyncStorage.setItem(refreshTokenKey, tokenResponse.refreshToken);
      }
      await AsyncStorage.setItem(expireTimeKey, expirationDate);

      return tokenResponse.accessToken;
    } catch (error) {
      console.error(`Sign-in error (${logPrefix}):`, error);
      throw error;
    }
  };

  // Método para firmar con la API personalizada
  static signInApiAsync = () =>
    AuthManager.signInAsync(AuthManager.AUTH_TYPES.API);

  // Método para firmar con Microsoft Graph
  static signInGraphAsync = () =>
    AuthManager.signInAsync(AuthManager.AUTH_TYPES.GRAPH);

  // Método genérico para obtener tokens
  static getAccessTokenAsync = async (authType) => {
    const isGraph = authType === AuthManager.AUTH_TYPES.GRAPH;
    const scopes = isGraph ? AuthConfig.graphScopes : AuthConfig.apiScopes;
    const tokenKey = isGraph ? "graphToken" : "apiToken";
    const refreshTokenKey = isGraph ? "graphRefreshToken" : "apiRefreshToken";
    const expireTimeKey = isGraph ? "graphExpireTime" : "apiExpireTime";
    const logPrefix = isGraph ? "Graph" : "API";

    try {
      const expireTime = await AsyncStorage.getItem(expireTimeKey);
      if (!expireTime) {
        console.warn(`No ${logPrefix} token found in storage.`);
        return null;
      }

      const expire = moment(expireTime).subtract(5, "minutes");
      const now = moment();

      if (now.isSameOrAfter(expire)) {
        console.log(`Refreshing ${logPrefix} token`);
        const refreshToken = await AsyncStorage.getItem(refreshTokenKey);
        if (!refreshToken) {
          console.warn(`No refresh token available for ${logPrefix}.`);
          return null;
        }

        const refreshResult = await AuthSession.refreshAsync(
          {
            clientId: AuthConfig.appId,
            refreshToken,
            scopes,
          },
          discovery
        );

        if (!refreshResult?.accessToken) {
          console.error(
            `Failed to refresh ${logPrefix} access token.`,
            refreshResult
          );
          return null;
        }

        const newExpirationDate = moment()
          .add(refreshResult.expiresIn, "seconds")
          .toISOString();

        await AsyncStorage.setItem(tokenKey, refreshResult.accessToken);
        if (refreshResult.refreshToken) {
          await AsyncStorage.setItem(
            refreshTokenKey,
            refreshResult.refreshToken
          );
        }
        await AsyncStorage.setItem(expireTimeKey, newExpirationDate);

        return refreshResult.accessToken;
      }

      const token = await AsyncStorage.getItem(tokenKey);
      if (!token) {
        console.warn(`${logPrefix} token not found in storage.`);
        return null;
      }

      return token;
    } catch (error) {
      console.error(`Get ${logPrefix} token error:`, error);
      return null;
    }
  };

  // Método para obtener token de la API personalizada
  static getApiAccessTokenAsync = () =>
    AuthManager.getAccessTokenAsync(AuthManager.AUTH_TYPES.API);

  // Método para obtener token de Microsoft Graph
  static getGraphAccessTokenAsync = () =>
    AuthManager.getAccessTokenAsync(AuthManager.AUTH_TYPES.GRAPH);

  // Método para cerrar sesión
  static signOutAsync = async () => {
    try {
      const keysToRemove = [
        "apiToken",
        "apiRefreshToken",
        "apiExpireTime",
        "graphToken",
        "graphRefreshToken",
        "graphExpireTime",
      ];
      await Promise.all(
        keysToRemove.map((key) => AsyncStorage.removeItem(key))
      );
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };
}
