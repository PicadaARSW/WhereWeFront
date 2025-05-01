// CustomDrawerContent.jsx
import React, { useContext } from "react";
import { Image, Text, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { UserContext } from "../UserContext";
import styles from "../styles/DrawerMenuStyles";
import PropTypes from "prop-types";

function CustomDrawerContent({ signOut, ...props }) {
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
        onPress={signOut}
      />
    </DrawerContentScrollView>
  );
}

CustomDrawerContent.propTypes = {
  signOut: PropTypes.func.isRequired,
};

export default CustomDrawerContent;
