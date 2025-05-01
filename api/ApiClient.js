import { AuthManager } from "../auth/AuthManager";
const BASEURL = "http://192.168.1.3";
export const ApiClient = async (url, method = "GET", body = null) => {
  try {
    // Obtener el token de almacenamiento local
    const apiToken = await AuthManager.getAccessTokenAsync();
    if (!apiToken) {
      throw new Error("No se pudo obtener el token de acceso para la API.");
    }

    const response = await fetch(`${BASEURL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.log("Error en ApiClient:", error);
  }
};
