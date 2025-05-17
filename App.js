import React, { useReducer, useEffect, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthManager } from "./auth/AuthManager";
import { AuthContext } from "./AuthContext";
import SignInScreen from "./screens/SignInScreen";
import MainScreen from "./MainScreen";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import { GraphManager } from "./graph/GraphManager";
import { UserProvider } from "./UserContext";
import GroupsScreen from "./screens/GroupsScreen";
import GroupDetailScreen from "./screens/GroupDetailScreen";
import GroupMapScreen from "./screens/GroupMapScreen";
import ProfilePictureSettings from "./screens/ProfilePictureSettings";
import EditProfileScreen from "./screens/EditProfileScreen";

const Stack = createStackNavigator();

const profilePictures = {
  "profile1.jpg": require("./images/Icon1.png"),
  "profile2.jpg": require("./images/Icon2.png"),
  "profile3.jpg": require("./images/Icon3.png"),
  "profile4.jpg": require("./images/Icon4.png"),
  "profile5.jpg": require("./images/Icon5.png"),
  "profile6.jpg": require("./images/Icon6.png"),
  "profile7.jpg": require("./images/Icon7.png"),
  "profile8.jpg": require("./images/Icon8.png"),
  "profile9.jpg": require("./images/Icon9.png"),
  "profile10.jpg": require("./images/Icon10.png"),
};

const headerOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: "#276b80",
  },
  headerTintColor: "white",
  headerTitleStyle: {
    fontWeight: "bold",
  },
};

const getScreens = (isLoading, userToken) => {
  if (isLoading) {
    return <Stack.Screen name="Loading" component={AuthLoadingScreen} />;
  }

  if (userToken == null) {
    return <Stack.Screen name="SignIn" component={SignInScreen} />;
  }

  return (
    <>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen
        name="GroupDetailScreen"
        component={GroupDetailScreen}
        options={{
          ...headerOptions,
          headerTitle: "Detalles del Grupo",
        }}
      />
      <Stack.Screen name="GroupMapScreen" component={GroupMapScreen} />
      <Stack.Screen
        name="ProfilePictureSettings"
        component={ProfilePictureSettings}
        options={{
          ...headerOptions,
          headerTitle: "Editar Foto de Perfil",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          ...headerOptions,
          headerTitle: "Configurar Perfil",
        }}
      />
    </>
  );
};

export default function App() {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignOut: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignOut: true,
            userToken: null,
          };
        case "UPDATE_USER":
          return {
            ...prevState,
            user: action.user,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignOut: false,
      userToken: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      try {
        userToken = await AuthManager.getAccessTokenAsync();
        const graphToken = await AuthManager.getGraphAccessTokenAsync();
        if (userToken && graphToken) {
          const userData = await GraphManager.getUserAsync();
          if (userData) {
            dispatch({
              type: "UPDATE_USER",
              user: {
                id: userData.id,
                userLoading: false,
                userFirstName: userData.userFirstName,
                userFullName: userData.userFullName,
                userEmail: userData.userEmail,
                userTimeZone: userData.userTimeZone,
                userPhoto: userData.userPhoto,
              },
            });
          }
          dispatch({ type: "RESTORE_TOKEN", token: userToken });
        } else {
          dispatch({ type: "RESTORE_TOKEN", token: null });
        }
      } catch (e) {
        console.error("Error restoring token or user data:", e);
        dispatch({ type: "RESTORE_TOKEN", token: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async () => {
        try {
          const token = await AuthManager.signInAsync();
          await AuthManager.signInGraphAsync();
          const userData = await GraphManager.getUserAsync();
          if (userData) {
            dispatch({
              type: "UPDATE_USER",
              user: {
                id: userData.id,
                userLoading: false,
                userFirstName: userData.userFirstName,
                userFullName: userData.userFullName,
                userEmail: userData.userEmail,
                userTimeZone: userData.userTimeZone,
                userPhoto: userData.userPhoto,
              },
            });
          }
          dispatch({ type: "SIGN_IN", token });
          return token;
        } catch (error) {
          console.error("Sign-in error:", error);
          throw error;
        }
      },
      signOut: async () => {
        await AuthManager.signOutAsync();
        dispatch({
          type: "UPDATE_USER",
          user: {
            id: "",
            userLoading: true,
            userFirstName: "",
            userFullName: "",
            userEmail: "",
            userTimeZone: "",
            userPhoto: require("./images/no-profile-pic.png"),
          },
        });
        dispatch({ type: "SIGN_OUT" });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContext}>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {getScreens(state.isLoading, state.userToken)}
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </AuthContext.Provider>
  );
}

// Export getScreens for testing
export { getScreens };
