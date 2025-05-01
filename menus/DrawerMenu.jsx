import React, { useContext, useCallback } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthContext } from "../AuthContext";
import HomeScreen from "../screens/HomeScreen";
import GroupsScreen from "../screens/GroupsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import CustomDrawerContent from "./CustomDrawerContent";

const Drawer = createDrawerNavigator();

export default function DrawerMenuContent() {
  const authContext = useContext(AuthContext);

  // Memorizamos la función drawerContent con useCallback
  const renderDrawerContent = useCallback(
    (props) => <CustomDrawerContent {...props} signOut={authContext.signOut} />,
    [authContext.signOut] // Dependencia: authContext.signOut
  );

  return (
    <Drawer.Navigator
      drawerType="front"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#276b80",
        },
        headerTintColor: "white",
      }}
      drawerContent={renderDrawerContent}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ drawerLabel: "Inicio", headerTitle: "Inicio" }}
      />
      <Drawer.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ drawerLabel: "Mis Grupos", headerTitle: "Mis Grupos" }}
      />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          drawerLabel: "Configurar Perfil",
          headerTitle: "Configurar Perfil",
        }}
      />
    </Drawer.Navigator>
  );
}
