import React, { useContext } from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import styles from "../styles/ProfilePictureSettingsStyles";
import { UserContext } from "../UserContext";

const profilePictures = [
  require("../images/Icon1.png"),
  require("../images/Icon2.png"),
  require("../images/Icon3.png"),
  require("../images/Icon4.png"),
  require("../images/Icon5.png"),
  require("../images/Icon6.png"),
  require("../images/Icon7.png"),
  require("../images/Icon8.png"),
  require("../images/Icon9.png"),
  require("../images/Icon10.png"),
];

const ProfilePictureSettings = ({ navigation }) => {
  const userContext = useContext(UserContext);

  console.log("UserContext:", userContext);
  console.log("UserPhot:", userContext.userPhoto);

  const updateProfilePicture = async (pictureURL) => {
    try {
      const response = await fetch(
        `http://192.168.50.103:8084/api/v1/users/${userContext.id}/profile-picture`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pictureUrl: pictureURL }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        userContext.setUser({
          ...updatedUser,
          userPhoto:
            profilePictures[
              parseInt(pictureURL.replace("profile", "").replace(".png", "")) -
                1
            ],
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => updateProfilePicture(`profile${index + 1}.png`)}
    >
      <Image source={item} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={profilePictures}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
      />
    </View>
  );
};

export default ProfilePictureSettings;
