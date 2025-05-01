import * as React from "react";
import PropTypes from "prop-types";

export const UserContext = React.createContext({
  userLoading: true,
  id: "",
  userFirstName: "",
  userFullName: "",
  userEmail: "",
  userTimeZone: "",
  userPhoto: require("./images/no-profile-pic.png"),
  setUser: () => {}, // Añadido: función para actualizar el estado del usuario
});

export const UserProvider = ({ children }) => {
  UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [user, setUser] = React.useState({
    id: "",
    userLoading: true,
    userFirstName: "",
    userFullName: "",
    userEmail: "",
    userTimeZone: "",
    userPhoto: require("./images/no-profile-pic.png"),
  });

  // Add debugging
  React.useEffect(() => {
    console.log("UserContext state:", user);
  }, [user]);

  const contextValue = React.useMemo(
    () => ({ ...user, setUser }),
    [user, setUser]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
