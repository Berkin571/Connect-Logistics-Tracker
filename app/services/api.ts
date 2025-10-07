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
    console.error("❌ Response Error:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("URL:", error.config?.url);
    return Promise.reject(error);
  }
);
