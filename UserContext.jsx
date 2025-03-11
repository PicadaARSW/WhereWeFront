import * as React from "react";
import { Image } from "react-native";

export const UserContext = React.createContext({
  userLoading: true,
  userFirstName: "",
  userFullName: "",
  userEmail: "",
  userTimeZone: "",
  userPhoto: require("./images/no-profile-pic.png"),
  setUser: () => {}, // Añadido: función para actualizar el estado del usuario
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = React.useState({
    userLoading: true,
    userFirstName: "",
    userFullName: "",
    userEmail: "",
    userTimeZone: "",
    userPhoto: require("./images/no-profile-pic.png"),
  });

  return (
    <UserContext.Provider value={{ ...user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
