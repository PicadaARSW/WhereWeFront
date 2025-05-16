import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import { IconButton } from "react-native-paper";
import styles from "../styles/UserItemStyles";
import { UserContext } from "../UserContext";
import { ApiClient } from "../api/ApiClient";
import CustomAlert from "./CustomAlert";

const UserItem = ({ user, isAdmin, groupId, onExpel }) => {
  const { id } = React.useContext(UserContext);
  const [showExpelAlert, setShowExpelAlert] = useState(false);

  const handleExpel = async () => {
    try {
      const response = await ApiClient(
        `groups/api/v1/groups/expel/${groupId}/${user.id}/${id}`,
        "DELETE"
      );
      if (response.ok) {
        onExpel(user.id);
      } else {
        console.error("Failed to expel member");
      }
    } catch (error) {
      console.error("Error expelling member:", error);
    }
  };

  const confirmExpel = () => {
    setShowExpelAlert(true);
  };

  return (
    <>
      <View style={styles.container} testID="user-item-container">
        <View style={{ flex: 1 }} testID="user-info-container">
          <Text style={styles.userName} testID="user-name">
            {user.userFullName}
          </Text>
          <Text style={styles.userEmail} testID="user-email">
            {user.userEmail}
          </Text>
        </View>
        {isAdmin && user.id !== id && (
          <IconButton
            icon="account-remove"
            iconColor="#f2f0eb"
            color="#fff"
            size={20}
            onPress={confirmExpel}
            style={styles.expelButton}
            testID="expel-button"
          />
        )}
      </View>
      <CustomAlert
        visible={showExpelAlert}
        title="Confirmar expulsión"
        message={`¿Estás seguro de que quieres expulsar a ${user.userFullName} del grupo?`}
        buttons={[
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setShowExpelAlert(false),
          },
          {
            text: "Expulsar",
            style: "destructive",
            onPress: handleExpel,
          },
        ]}
        onClose={() => setShowExpelAlert(false)}
        testID="expel-alert"
      />
    </>
  );
};

UserItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userFullName: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  onExpel: PropTypes.func.isRequired,
};

export default UserItem;
