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

      return {
        id: user.id,
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
