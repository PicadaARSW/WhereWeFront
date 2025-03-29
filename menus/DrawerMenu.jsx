import React, { useContext } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

import { AuthContext } from "../AuthContext";
import { UserContext } from "../UserContext";
import HomeScreen from "../screens/HomeScreen";
import GroupsScreen from "../screens/GroupsScreen";
import { GraphManager } from "../graph/GraphManager";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const userContext = useContext(UserContext);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileView}>
        <Image
          source={
            userContext?.userPhoto || require("../images/no-profile-pic.png")
          }
          resizeMode="contain"
          style={styles.profilePhoto}
        />
        <Text style={styles.profileUserName}>
          {userContext?.userFullName || "Usuario"}
        </Text>
        <Text style={styles.profileEmail}>
          {userContext?.userEmail || "Correo no disponible"}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem label="Sign Out" onPress={props.signOut} />
    </DrawerContentScrollView>
  );
};

export default function DrawerMenuContent() {
  const authContext = useContext(AuthContext);

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
      drawerContent={(props) => (
        <CustomDrawerContent {...props} signOut={authContext.signOut} />
      )}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ drawerLabel: "Inicio", headerTitle: "Inicio" }}
      />
      <Drawer.Screen
        name="Groups"
        component={GroupsScreen} // Se añadió la pantalla de grupos
        options={{ drawerLabel: "Mis Grupos", headerTitle: "Mis Grupos" }} // Configuración de la nueva pantalla
      />

      
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileView: {
    alignItems: "center",
    padding: 10,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileUserName: {
    fontWeight: "700",
  },
  profileEmail: {
    fontWeight: "200",
    fontSize: 10,
  },
});
