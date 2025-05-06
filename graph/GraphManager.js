import { Client } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "./GraphAuthProvider";

// Set the authProvider to an instance
// of GraphAuthProvider
const clientOptions = {
  authProvider: new GraphAuthProvider(),
};

// Initialize the client
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

      // Obtener datos adicionales desde tu backend
      const backendResponse = await fetch(
        `http://192.168.1.6:8084/api/v1/users/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let profilePicture = require("../images/no-profile-pic.png");
      let backendUser = null;

      if (backendResponse.ok) {
        backendUser = await backendResponse.json();
        // Mapear la foto de perfil desde el backend a las imágenes locales
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
