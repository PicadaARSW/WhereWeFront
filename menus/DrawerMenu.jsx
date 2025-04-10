import React, { useContext } from "react";
import { Image, Text, View } from "react-native";
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
import EditProfileScreen from "../screens/EditProfileScreen";
import { GraphManager } from "../graph/GraphManager";
import styles from "../styles/DrawerMenuStyles";

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
      <DrawerItem
        labelStyle={[styles.signOutLabel]}
        label="Cerrar Sesión"
        onPress={props.signOut}
      />
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
