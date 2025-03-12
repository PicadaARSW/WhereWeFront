import AsyncStorage from "@react-native-async-storage/async-storage";
const BASEURL = "http://192.168.50.219";
export const ApiClient = async (url, method = "GET", body = null) => {
  try {
    // Obtener el token de almacenamiento local
    /*const accessToken = await AsyncStorage.getItem("userToken");
    console.log("Token de acceso:", accessToken);
    if (!accessToken) {
      throw new Error("No se encontró un token de acceso.");
    }*/

    const response = await fetch(`${BASEURL}${url}`, {
      method,
      /*headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },*/
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en ApiClient:", error);
    throw error;
  }
};
