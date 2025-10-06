import * as Location from "expo-location";
import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSocket } from "../services/socket";
import type { LocationPoint, LocationUpdatePayload } from "../types/location";

export function useLiveLocation(enabled: boolean) {
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || !session) return;

      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        async (loc) => {
          if (!mounted || !session) return;
          const point: LocationPoint = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? undefined,
            altitude: loc.coords.altitude ?? null,
            speed: loc.coords.speed ?? null,
            heading: loc.coords.heading ?? null,
            timestamp: loc.timestamp,
          };
          const payload: LocationUpdatePayload = {
            userId: session.user.id,
            companyId: session.user.companyId,
            point,
          };
          const socket = await getSocket();
          socket.emit("location:update", payload);
        }
      );
    }

    if (enabled) start();

    return () => {
      mounted = false;
      watcher.current?.remove();
      watcher.current = null;
    };
  }, [enabled, session]);
}
