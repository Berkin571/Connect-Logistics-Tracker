import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Env } from "../utils/env";

console.log("🌐 API Base URL:", Env.API_URL);

export const api = axios.create({
  baseURL: Env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 Sekunden Timeout
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Nur wichtige Fehler loggen (keine 404 für optionale Endpoints)
    if (error.config?.url?.includes("/geofences")) {
      console.warn("⚠️ Geofences nicht verfügbar (404) - wird ignoriert");
    } else {
      console.error("❌ Response Error:", error.message);
      console.error("Status:", error.response?.status);
      console.error("URL:", error.config?.url);
      if (error.response?.status !== 404) {
        console.error("Data:", error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);
