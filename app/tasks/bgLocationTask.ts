// src/tasks/bgLocationTask.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationObject } from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

const OFFLINE_QUEUE_KEY = "offline-loc-queue";
export const BG_LOCATION_TASK = "bg-location-task";

// kleine Helper, damit das Task-File keine App-Imports braucht
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

async function enqueue(payload: any) {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(payload);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(arr));
}

async function flushQueue(token: string) {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return;
  const arr: any[] = JSON.parse(raw);
  if (arr.length === 0) return;
  try {
    await fetch(`${API_URL}/locations/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: arr }),
    });
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch {
    // offline -> im Puffer lassen
  }
}

TaskManager.defineTask(BG_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const { locations } = data as { locations: LocationObject[] };
  const last = locations?.[locations.length - 1];
  if (!last) return;

  const token = await SecureStore.getItemAsync("accessToken");
  const userJson = await SecureStore.getItemAsync("user");
  if (!token || !userJson) return;

  const user = JSON.parse(userJson);
  const payload = {
    userId: user.id,
    companyId: user.companyId,
    point: {
      lat: last.coords.latitude,
      lng: last.coords.longitude,
      accuracy: last.coords.accuracy,
      altitude: last.coords.altitude,
      speed: last.coords.speed,
      heading: last.coords.heading,
      timestamp: last.timestamp,
    },
  };

  try {
    await fetch(`${API_URL}/locations/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    await flushQueue(token);
  } catch {
    await enqueue(payload);
  }
});
