import React from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { AuthManager } from "../auth/AuthManager";

import { AuthContext } from "../AuthContext";
import { UserContext } from "../UserContext";
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import { GraphManager } from "../graph/GraphManager";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => (
  <DrawerContentScrollView {...props}>
    <View style={styles.profileView}>
      <Image
        source={props.userPhoto}
        resizeMode="contain"
        style={styles.profilePhoto}
      />
      <Text style={styles.profileUserName}>{props.userName}</Text>
      <Text style={styles.profileEmail}>{props.userEmail}</Text>
    </View>
    <DrawerItemList {...props} />
    <DrawerItem label="Sign Out" onPress={props.signOut} />
  </DrawerContentScrollView>
);

export default class DrawerMenuContent extends React.Component {
  static contextType = AuthContext;

  state = {
    userLoading: true,
    userFirstName: "Adele",
    userFullName: "Adele Vance",
    userEmail: "adelev@contoso.com",
    userTimeZone: "UTC",
    userPhoto: require("../images/no-profile-pic.png"),
  };

  _signOut = async () => {
    this.context.signOut();
  };

  async componentDidUpdate(prevProps, prevState) {
    if (this.context.userToken !== prevState.userToken) {
      // Se detectó un cambio en el token, volver a cargar el usuario
      const user = await GraphManager.getUserAsync();
      this.setState({
        userFirstName: user.givenName,
        userFullName: user.displayName,
        userEmail: user.mail || user.userPrincipalName,
      });
    }
  }

  render() {
    const userLoaded = !this.state.userLoading;

    return (
      <UserContext.Provider value={this.state}>
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
            <CustomDrawerContent
              {...props}
              userName={this.state.userFullName}
              userEmail={this.state.userEmail}
              userPhoto={this.state.userPhoto}
              signOut={this._signOut}
            />
          )}
        >
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{ drawerLabel: "Home", headerTitle: "Welcome" }}
          />
          {userLoaded && (
            <Drawer.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ drawerLabel: "Calendar" }}
            />
          )}
        </Drawer.Navigator>
      </UserContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
