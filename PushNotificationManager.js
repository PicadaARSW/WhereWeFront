import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  console.log("Iniciando registerForPushNotificationsAsync");
  if (Device.isDevice) {
    console.log("Es un dispositivo físico");
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("Estado de permisos existente:", existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Nuevo estado de permisos:", status);
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permisos no otorgados, no se generará token");
      return;
    }

    console.log("Permisos otorgados, intentando obtener token...");
    try {
      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId: "fa3c4283-f71b-40d3-894f-0820f6c12cec"
      });
      token = tokenResult.data;
      console.log("Token generado exitosamente:", token);
    } catch (error) {
      console.error("Error al obtener el token push:", error);
    }

    if (Platform.OS === "android") {
      console.log("Configurando canal de notificación para Android");
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  } else {
    console.log("No es un dispositivo físico, no se generará token");
  }

  console.log("Token final devuelto:", token);
  return token;
}

export function setupNotificationListener(listener) {
  const subscription = Notifications.addNotificationReceivedListener(listener);
  return () => subscription.remove();
}