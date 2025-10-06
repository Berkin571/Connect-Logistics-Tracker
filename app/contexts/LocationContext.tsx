import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { api } from "../services/api";
import { ensureNotificationPermissions } from "../services/notifications";
import { BG_LOCATION_TASK } from "../tasks/bgLocationTask";
import { GEOFENCE_TASK } from "../tasks/geofenceTask";
import type { GeofenceRegion } from "../types/location";

type LocationCtx = {
  sharing: boolean;
  setSharing: (v: boolean) => void;
  background: boolean;
  setBackground: (v: boolean) => void;
  geofences: GeofenceRegion[];
  refreshGeofences: () => Promise<void>;
};

const Ctx = createContext<LocationCtx | undefined>(undefined);

export const LocationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [sharing, setSharing] = useState(false);
  const [background, setBackgroundState] = useState(false);
  const [geofences, setGeofences] = useState<GeofenceRegion[]>([]);
  const { session } = useAuth();

  useLiveLocation(sharing);

  useEffect(() => {
    (async () => {
      await ensureNotificationPermissions();
    })();
  }, []);

  const startGeofencing = async (regions: GeofenceRegion[]) => {
    const expoRegions = regions.map((r) => ({
      identifier: r.id,
      latitude: r.lat,
      longitude: r.lng,
      radius: r.radius,
      notifyOnEnter: true,
      notifyOnExit: true,
    }));
    if (await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }
    if (expoRegions.length > 0) {
      await Location.startGeofencingAsync(GEOFENCE_TASK, expoRegions);
    }
  };

  const setBackground = useCallback(
    async (v: boolean) => {
      setBackgroundState(v);
      if (!session) return;

      if (v) {
        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== "granted") return;
        const bg = await Location.requestBackgroundPermissionsAsync();
        if (bg.status !== "granted") return;

        await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 20,
          showsBackgroundLocationIndicator: true,
          pausesUpdatesAutomatically: true,
          activityType: Location.ActivityType.AutomotiveNavigation,
          foregroundService: {
            notificationTitle: "Live-Tracking aktiv",
            notificationBody: "Standort wird im Hintergrund geteilt.",
          },
        });

        if (geofences.length > 0) await startGeofencing(geofences);
      } else {
        if (await TaskManager.isTaskRegisteredAsync(BG_LOCATION_TASK))
          await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK);
        if (await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK))
          await Location.stopGeofencingAsync(GEOFENCE_TASK);
      }
    },
    [session, geofences]
  );

  const refreshGeofences = useCallback(async () => {
    if (!session) return;
    const res = await api.get(`/geofences?companyId=${session.user.companyId}`);
    const list = res.data as GeofenceRegion[];
    setGeofences(list);
    if (background) await startGeofencing(list);
  }, [session, background]);

  useEffect(() => {
    refreshGeofences();
  }, [refreshGeofences]);

  return (
    <Ctx.Provider
      value={{
        sharing,
        setSharing,
        background,
        setBackground,
        geofences,
        refreshGeofences,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export function useLocationSharing() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useLocationSharing must be used within LocationProvider");
  return ctx;
}
