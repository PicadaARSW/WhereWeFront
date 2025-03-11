import React, { useReducer, useEffect, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthManager } from "./auth/AuthManager";
import { AuthContext } from "./AuthContext";
import { UserContext } from "./UserContext";
import SignInScreen from "./screens/SignInScreen";
import MainScreen from "./MainScreen";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import { GraphManager } from "./graph/GraphManager";
import { UserProvider } from "./UserContext";

const Stack = createStackNavigator();

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
      } catch (e) {
        console.error("Error restoring token:", e);
      }
      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async () => {
        try {
          await AuthManager.signInAsync();
          const token = await AuthManager.getAccessTokenAsync();
          dispatch({ type: "SIGN_IN", token });

          const user = await GraphManager.getUserAsync();
          dispatch({ type: "UPDATE_USER", user });
        } catch (error) {
          throw error;
        }
      },
      signOut: async () => {
        await AuthManager.signOutAsync();
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
            {state.isLoading ? (
              <Stack.Screen name="Loading" component={AuthLoadingScreen} />
            ) : state.userToken == null ? (
              <Stack.Screen name="SignIn" component={SignInScreen} />
            ) : (
              <Stack.Screen name="Main" component={MainScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </AuthContext.Provider>
  );
}
