import type { LocationRegion } from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { notifyLocal } from "../services/notifications";
import { Env } from "../utils/env";

export const GEOFENCE_TASK = "geofence-task";

type GeofenceData = {
  eventType: number;
  region: LocationRegion & { identifier?: string };
};

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;
  const d = data as GeofenceData;
  if (!d?.region?.identifier) return;

  const token = await SecureStore.getItemAsync("accessToken");
  const userJson = await SecureStore.getItemAsync("user");
  if (!token || !userJson) return;

  const user = JSON.parse(userJson);
  const transition = d.eventType === 1 ? "enter" : "exit";
  const eventPayload = {
    userId: user.id,
    companyId: user.companyId,
    regionId: String(d.region.identifier),
    transition,
    timestamp: Date.now(),
  };

  try {
    await fetch(`${Env.API_URL}/geofences/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventPayload),
    });
  } catch {
    // ignore
  }

  await notifyLocal(
    transition === "enter" ? "Geofence betreten" : "Geofence verlassen",
    `Zone: ${d.region.identifier}`
  );
});
