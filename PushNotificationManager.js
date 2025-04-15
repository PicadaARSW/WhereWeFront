import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;

  console.log("Iniciando registerForPushNotificationsAsync");

  // Verificar permisos de notificaciones
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Permisos otorgados, intentando obtener token...");

    try {
      // Obtener el token FCM
      token = await messaging().getToken();
      console.log("Token generado exitosamente:", token);
    } catch (error) {
      console.error("Error al obtener el token push:", error);
    }
  } else {
    console.log("Permisos no otorgados, no se generará token");
  }

  if (Platform.OS === 'android') {
    console.log("Configurando canal de notificación para Android");
    await messaging().createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 4, // IMPORTANCE_HIGH
      soundName: 'default',
      vibration: true,
    });
  }

  console.log("Token final devuelto:", token);
  return token;
}

export function setupNotificationListener(listener) {
  // Escuchar notificaciones en foreground
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('Notificación recibida en foreground:', remoteMessage);
    listener(remoteMessage);
  });

  // Escuchar notificaciones en background
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Notificación recibida en background:', remoteMessage);
  });

  return () => unsubscribeForeground();
}