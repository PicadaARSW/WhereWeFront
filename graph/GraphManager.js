import { Client } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "./GraphAuthProvider";
import { ApiClient } from "../api/ApiClient";

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
        .select("displayName,givenName,mail,mailboxSettings,userPrincipalName")
        .get();

      return {
        userFirstName: user.givenName,
        userFullName: user.displayName,
        userEmail: user.mail || user.userPrincipalName,
        userTimeZone: user.mailboxSettings?.timeZone || "UTC",
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };
}
