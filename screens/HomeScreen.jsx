import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UserContext } from "../UserContext";

import { useEffect } from "react";

const HomeComponent = () => {
  const userContext = React.useContext(UserContext);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await GraphManager.getUserAsync();
      UserContext((prevState) => ({ ...prevState, ...user }));
    };

    fetchUser();
  }, [userContext.userToken]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        color={Platform.OS === "android" ? "#276b80" : undefined}
        animating={userContext.userLoading}
        size="large"
      />
      {userContext.userLoading ? null : (
        <Text>Hello {userContext.userFirstName}!</Text>
      )}
    </View>
  );
};

export default function HomeScreen() {
  return <HomeComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
