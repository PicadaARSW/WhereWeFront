import * as React from "react";

export const AuthContext = React.createContext({
  signIn: async () => {},
  signOut: () => {},
});
