import { Client } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "./GraphAuthProvider";
import { ApiClient } from "../api/ApiClient";

const clientOptions = {
  authProvider: new GraphAuthProvider(),
};

const graphClient = Client.initWithMiddleware(clientOptions);

export class GraphManager {
  static getUserAsync = async () => {
    try {
      const user = await graphClient
        .api("/me")
        .select(
          "displayName,givenName,mail,mailboxSettings,userPrincipalName,id"
        )
        .get();

      const backendResponse = await ApiClient(`users/api/v1/users/${user.id}`);

      let profilePicture = require("../images/no-profile-pic.png");
      let backendUser = null;

      if (backendResponse.ok) {
        backendUser = await backendResponse.json();
        const profilePictures = {
          "profile1.png": require("../images/Icon1.png"),
          "profile2.png": require("../images/Icon2.png"),
          "profile3.png": require("../images/Icon3.png"),
          "profile4.png": require("../images/Icon4.png"),
          "profile5.png": require("../images/Icon5.png"),
          "profile6.png": require("../images/Icon6.png"),
          "profile7.png": require("../images/Icon7.png"),
          "profile8.png": require("../images/Icon8.png"),
          "profile9.png": require("../images/Icon9.png"),
          "profile10.png": require("../images/Icon10.png"),
        };
        profilePicture =
          profilePictures[backendUser.profilePicture] ||
          require("../images/no-profile-pic.png");
      } else {
        console.warn(
          `Error al obtener datos del backend: ${backendResponse.status} ${backendResponse.statusText}`
        );
      }

      return {
        id: user.id,
        userFirstName: user.givenName,
        userFullName: user.displayName,
        userEmail: user.mail || user.userPrincipalName,
        userTimeZone: user.mailboxSettings?.timeZone || "UTC",
        userPhoto: profilePicture,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };
}
