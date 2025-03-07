import * as React from "react";
import { Image } from "react-native";

export const UserContext = React.createContext({
  userLoading: true,
  userFirstName: "",
  userFullName: "",
  userEmail: "",
  userTimeZone: "",
  userPhoto: require("./images/no-profile-pic.png"),
});
