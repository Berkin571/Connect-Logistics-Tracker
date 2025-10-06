import * as ExpoLocation from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeModules,
  Platform,
  Pressable,
  Text as RNText,
  StyleSheet,
  UIManager,
  View,
} from "react-native";

function hasNativeMaps(): boolean {
  const nm: any = NativeModules || {};
  const newArch = !!nm?.RNMapsAirModule;
  const oldArch =
    typeof UIManager?.getViewManagerConfig === "function" &&
    !!UIManager.getViewManagerConfig("AIRMap");
  return !!(newArch || oldArch);
}

let RNMaps: any = null;
try {
  RNMaps = require("react-native-maps");
} catch {
  // Kein Native-Modul vorhanden (z. B. Expo Go) – Platzhalter verwenden
}

const MAPS_AVAILABLE = !!RNMaps && hasNativeMaps();
const MapView = RNMaps?.default ?? ((p: any) => <View {...p} />);
const Marker = RNMaps?.Marker ?? (() => null);
const Circle = RNMaps?.Circle ?? (() => null);
const PROVIDER_GOOGLE = RNMaps?.PROVIDER_GOOGLE ?? "google";

import LocationShareToggle from "@/components/LocationShareToggle";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  HStack,
  Text,
} from "@gluestack-ui/themed";
import { useAuth } from "../contexts/AuthContext";
import { useLocationSharing } from "../contexts/LocationContext";
import { getSocket } from "../services/socket";
import type { LocationUpdatePayload } from "../types/location";

type VisibleLoc = LocationUpdatePayload & { name?: string };

// Wie lange auf Serverdaten warten, bevor wir lokal (Simulator/Device) übernehmen
const SERVER_DATA_GRACE_MS = 3000;

export default function MapScreen() {
  const { session, logout } = useAuth();
  const { geofences, refreshGeofences } = useLocationSharing();

  const [visible, setVisible] = useState<VisibleLoc[]>([]);
  const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [usingServer, setUsingServer] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const mapRef = useRef<any>(null);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackWatcherRef = useRef<ExpoLocation.LocationSubscription | null>(
    null
  );

  // ---- Hilfsfunktionen
  const startFallbackWatch = async () => {
    if (fallbackWatcherRef.current) return;
    try {
      const fg = await ExpoLocation.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") return;
      // sofortige Position holen
      const first = await ExpoLocation.getCurrentPositionAsync({});
      const coords = {
        lat: first.coords.latitude,
        lng: first.coords.longitude,
      };
      setMyLoc(coords);
      mapRef.current?.animateToRegion(
        {
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        700
      );
      // live weiter beobachten
      fallbackWatcherRef.current = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Balanced,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          const c = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          setMyLoc(c);
        }
      );
      setUsingFallback(true);
    } catch {
      // Ignorieren (keine Permission / kein GPS)
    }
  };

  const stopFallbackWatch = () => {
    fallbackWatcherRef.current?.remove();
    fallbackWatcherRef.current = null;
    setUsingFallback(false);
  };

  // ---- Socket: Serverdaten bevorzugt
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const socket = await getSocket();

        // Ab jetzt zählen wir auf Serverdaten – aber mit Grace-Timeout
        if (!graceTimerRef.current) {
          graceTimerRef.current = setTimeout(() => {
            if (!usingServer && !usingFallback) {
              // Keine Serverdaten innerhalb des Grace-Intervalls -> Fallback starten
              startFallbackWatch();
            }
          }, SERVER_DATA_GRACE_MS);
        }

        socket.on("locations:visible", (list: VisibleLoc[]) => {
          if (!mounted) return;
          setVisible(list);

          const me = list.find((l) => l.userId === session?.user.id);
          if (me) {
            // Server liefert meine Position -> Server-Modus aktivieren
            setUsingServer(true);
            if (usingFallback) stopFallbackWatch();

            const coords = { lat: me.point.lat, lng: me.point.lng };
            setMyLoc(coords);
            // sanft zentrieren (insb. beim ersten Serverhit)
            mapRef.current?.animateToRegion(
              {
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              600
            );
          } else {
            // Server antwortet, aber (noch) ohne mich -> wenn noch kein Fallback läuft, starte ihn
            if (!usingFallback && !usingServer) startFallbackWatch();
          }
        });

        socket.on("geofences:updated", () => refreshGeofences());
        socket.on("geofences:deleted", () => refreshGeofences());

        socket.emit("locations:subscribe");
      } catch {
        // Kein Socket (z. B. Mock-Login ohne Token) -> direkt Fallback
        startFallbackWatch();
      }
    })();

    return () => {
      mounted = false;
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
      stopFallbackWatch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, refreshGeofences]);

  // Initialregion (bevor wir MyLoc kennen)
  const initialRegion = useMemo(
    () => ({
      latitude: myLoc?.lat ?? 48.1374,
      longitude: myLoc?.lng ?? 11.5755,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    }),
    [myLoc]
  );

  async function centerOnMe() {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await ExpoLocation.getCurrentPositionAsync({});
      const c = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setMyLoc(c);
      mapRef.current?.animateToRegion(
        {
          latitude: c.lat,
          longitude: c.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        700
      );
    } catch {
      /* ignore */
    }
  }

  return (
    <Box flex={1}>
      <HStack p="$3" justifyContent="space-between" alignItems="center">
        <Text>
          Angemeldet: {session?.user.name} ({session?.user.roles.join(", ")})
        </Text>
        <HStack space="md" alignItems="center">
          <LocationShareToggle />
          <Button action="negative" onPress={logout}>
            <ButtonText>Logout</ButtonText>
          </Button>
        </HStack>
      </HStack>

      {!MAPS_AVAILABLE && (
        <HStack px="$3" py="$2">
          <Badge action="warning">
            <BadgeText>
              {Platform.OS === "web"
                ? "Web: Platzhalter statt Karte"
                : "react-native-maps nicht in der Binary – Platzhalter aktiv"}
            </BadgeText>
          </Badge>
        </HStack>
      )}

      {MAPS_AVAILABLE ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            showsUserLocation
          >
            {/* Server-Marker (du & andere, wenn durch RBAC sichtbar) */}
            {visible.map((l) => (
              <Marker
                key={`${l.userId}-${l.point.timestamp}`}
                coordinate={{ latitude: l.point.lat, longitude: l.point.lng }}
                title={l.name ?? l.userId}
                description={`Firma: ${l.companyId}`}
              />
            ))}

            {/* Geofences */}
            {geofences.map((g) => (
              <Circle
                key={`gf-${g.id}`}
                center={{ latitude: g.lat, longitude: g.lng }}
                radius={g.radius}
              />
            ))}

            {/* Fallback: falls (noch) kein Server-Marker für mich existiert, zeige lokalen Marker */}
            {!visible.some((v) => v.userId === session?.user.id) && myLoc && (
              <Marker
                coordinate={{ latitude: myLoc.lat, longitude: myLoc.lng }}
                title="Du"
                description={
                  usingFallback
                    ? "Lokale Position (Fallback)"
                    : "Deine Position"
                }
              />
            )}
          </MapView>
          <Pressable
            onPress={centerOnMe}
            style={{
              position: "absolute",
              right: 16,
              bottom: 20,
              backgroundColor: "white",
              borderRadius: 24,
              paddingHorizontal: 12,
              paddingVertical: 12,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <RNText>📍</RNText>
          </Pressable>
        </>
      ) : (
        <View style={styles.placeholder}>
          <RNText style={{ fontSize: 16, color: "#666" }}>
            Karten-Platzhalter (react-native-maps nicht geladen)
          </RNText>
        </View>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 80,
  },
  placeholder: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 80,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
});
