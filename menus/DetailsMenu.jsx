import React, { useContext } from "react";
import { Image, Text, View } from "react-native";
import {createDrawerNavigator,DrawerContentScrollView, DrawerItem,} from "@react-navigation/drawer";
import { AuthContext } from "../AuthContext";
import { UserContext } from "../UserContext";
import styles from "../styles/DrawerMenuStyles";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { signOut } = useContext(AuthContext);
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
      <DrawerItem
        label="Inicio"
        onPress={() => props.navigation.navigate("Main", { screen: "Home" })} 
      />
      <DrawerItem
        label="Cerrar Sesión"
        onPress={() => {
          signOut();
          props.navigation.navigate("SignIn"); 
        }}
      />
    </DrawerContentScrollView>
  );
};

const DetailsMenu = ({ children }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#276b80" },
        headerTintColor: "white",
      }}
    >
      <Drawer.Screen
        name="GroupDetails"
        component={children}
        options={{ drawerLabel: "Detalles del Grupo", headerTitle: "Detalles del Grupo" }}
      />
    </Drawer.Navigator>
  );
};

export default DetailsMenu;