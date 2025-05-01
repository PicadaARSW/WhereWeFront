import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/CustomAlertStyles";

const CustomAlert = ({ visible, title, message, buttons, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttonContainer}>
            {buttons.map((button) => (
              <TouchableOpacity
                key={button.key || button.text}
                style={[
                  styles.button,
                  button.style === "destructive" && styles.destructiveButton,
                  button.style === "cancel" && styles.cancelButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "destructive" &&
                      styles.destructiveButtonText,
                    button.style === "cancel" && styles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
CustomAlert.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      onPress: PropTypes.func,
      style: PropTypes.oneOf(["default", "cancel", "destructive"]),
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomAlert;
