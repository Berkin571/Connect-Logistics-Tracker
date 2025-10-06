import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Env } from "../utils/env";

export const api = axios.create({ baseURL: Env.API_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
