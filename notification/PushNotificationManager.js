import { Platform, PermissionsAndroid, NativeModules } from "react-native";
import messaging from "@react-native-firebase/messaging";

console.log("Inicializando PushNotificationManager...");

async function createNotificationChannel() {
  if (Platform.OS === "android") {
    try {
      console.log("Creando canal de notificaciones...");
      const { Notifications } = NativeModules;
      if (Notifications && Notifications.createChannel) {
        await Notifications.createChannel({
          channelId: "default",
          name: "Default Channel",
          importance: 4, // IMPORTANCE_HIGH
          sound: "default",
          vibrate: true,
        });
        console.log("Canal de notificaciones creado: default");
      } else {
        console.warn(
          "Módulo nativo de notificaciones no disponible, usando canal por defecto de Firebase"
        );
      }
    } catch (error) {
      console.error("Error al crear canal de notificaciones:", error);
    }
  }
}

export async function registerForPushNotificationsAsync() {
  console.log("Iniciando registerForPushNotificationsAsync");
  console.log("Versión de Android:", Platform.Version);

  try {
    console.log("Verificando inicialización de Firebase...");
    const firebaseApp = await messaging().app;
    console.log(
      "Firebase Messaging inicializado en el frontend:",
      firebaseApp.name
    );
  } catch (error) {
    console.error("Error al inicializar Firebase en el frontend:", error);
    return null;
  }

  await createNotificationChannel();

  if (Platform.OS === "android" && Platform.Version >= 33) {
    try {
      console.log("Solicitando permiso POST_NOTIFICATIONS...");
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Permiso de Notificaciones",
          message:
            "Esta aplicación necesita permiso para enviarte notificaciones.",
          buttonPositive: "Aceptar",
          buttonNegative: "Cancelar",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permiso POST_NOTIFICATIONS otorgado");
      } else {
        console.log("Permiso POST_NOTIFICATIONS denegado");
        return null;
      }
    } catch (error) {
      console.error("Error al solicitar permiso POST_NOTIFICATIONS:", error);
      return null;
    }
  } else {
    console.log(
      "No se requiere solicitud de POST_NOTIFICATIONS (API < 33 o no Android)"
    );
  }

  let token;
  try {
    console.log("Verificando permisos de Firebase Messaging...");
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log(
        "Permisos de Firebase otorgados, intentando obtener token..."
      );
      token = await messaging().getToken();
      console.log("Token generado exitosamente:", token);
    } else {
      console.log("Permisos de Firebase no otorgados, no se generará token");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el token push:", error);
    return null;
  }

  console.log("Token final devuelto:", token);
  return token;
}

export function setupNotificationListener(listener) {
  console.log("Configurando listener de notificaciones...");

  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log(
      "Notificación recibida en foreground:",
      JSON.stringify(remoteMessage)
    );
    listener(remoteMessage);
  });

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log(
      "Notificación recibida en background:",
      JSON.stringify(remoteMessage)
    );
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log(
      "App abierta desde notificación:",
      JSON.stringify(remoteMessage)
    );
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          "App iniciada desde notificación:",
          JSON.stringify(remoteMessage)
        );
      }
    });

  return () => {
    console.log("Desuscribiendo listener de notificaciones...");
    unsubscribeForeground();
  };
}
