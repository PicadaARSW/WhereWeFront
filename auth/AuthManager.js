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

const redirectUri = AuthSession.makeRedirectUri({
    native: "wherewe://redirect",
    useProxy: true
     });
console.log("Default redirect URI:", redirectUri);

export class AuthManager {
  static signInAsync = async () => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: AuthConfig.appId,
        scopes: AuthConfig.appScopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { prompt: "select_account" },
      });

      const result = await authRequest.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        console.error("No authorization code received.", result);
        throw new Error("Authentication failed. No code received.");
      }

      console.log("Authorization Code:", result.params.code);

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: AuthConfig.appId,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: authRequest.codeVerifier,
          },
        },
        discovery
      );

      if (!tokenResponse?.accessToken) {
        console.error("Token exchange failed.", tokenResponse);
        throw new Error("Failed to obtain access token.");
      }

      const expirationDate = moment()
        .add(tokenResponse.expiresIn, "seconds")
        .toISOString();

      console.log("Access Token:", tokenResponse.accessToken);

      await AsyncStorage.setItem("userToken", tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await AsyncStorage.setItem("refreshToken", tokenResponse.refreshToken);
      }
      await AsyncStorage.setItem("expireTime", expirationDate);

      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  static signOutAsync = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("expireTime");
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  static getAccessTokenAsync = async () => {
    try {
      const expireTime = await AsyncStorage.getItem("expireTime");
      if (!expireTime) return null;

      const expire = moment(expireTime).subtract(5, "minutes");
      const now = moment();

      if (now.isSameOrAfter(expire)) {
        console.log("Refreshing token");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) return null;

        const refreshResult = await AuthSession.refreshAsync(
          {
            clientId: AuthConfig.appId,
            refreshToken,
            scopes: AuthConfig.appScopes,
          },
          discovery
        );

        if (!refreshResult?.accessToken) {
          console.error("Failed to refresh access token.", refreshResult);
          return null;
        }

        const newExpirationDate = moment()
          .add(refreshResult.expiresIn, "seconds")
          .toISOString();

        await AsyncStorage.setItem("userToken", refreshResult.accessToken);
        if (refreshResult.refreshToken) {
          await AsyncStorage.setItem(
            "refreshToken",
            refreshResult.refreshToken
          );
        }
        await AsyncStorage.setItem("expireTime", newExpirationDate);

        return refreshResult.accessToken;
      }

      return await AsyncStorage.getItem("userToken");
    } catch (error) {
      console.error("Get token error:", error);
      return null;
    }
  };
}
