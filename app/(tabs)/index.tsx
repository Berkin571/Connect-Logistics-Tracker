import * as ExpoLocation from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeModules,
  Platform,
  Pressable,
  Text as RNText,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
const Callout = RNMaps?.Callout ?? (() => null);
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
import { useCompanies } from "../contexts/CompanyContext";
import { useLocationSharing } from "../contexts/LocationContext";
import { getSocket } from "../services/socket";
import type { LocationUpdatePayload } from "../types/location";

type VisibleLoc = LocationUpdatePayload & { name?: string };

// Wie lange auf Serverdaten warten, bevor wir lokal (Simulator/Device) übernehmen
const SERVER_DATA_GRACE_MS = 3000;

export default function MapScreen() {
  const { session, logout } = useAuth();
  const { geofences, refreshGeofences } = useLocationSharing();
  const { getCompanyName } = useCompanies();

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

  const userName =
    session?.user.fullName ||
    `${session?.user.firstName} ${session?.user.lastName}`;
  const userRole = session?.user.role || session?.user.roles?.[0];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      edges={["top"]}
    >
      <Box flex={1} bg="$backgroundLight0">
        {/* Modern Header */}
        <Box
          px="$4"
          py="$3"
          bg="$white"
          borderBottomWidth={1}
          borderBottomColor="$borderLight200"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={4}
          elevation={2}
        >
          <HStack justifyContent="space-between" alignItems="center">
            {/* User Info */}
            <Box flex={1}>
              <Text fontSize="$lg" fontWeight="$semibold" color="$textLight900">
                {userName}
              </Text>
              <HStack space="xs" alignItems="center" mt="$1">
                <Badge size="sm" variant="solid" action="info">
                  <BadgeText fontSize="$xs">
                    {userRole?.toUpperCase()}
                  </BadgeText>
                </Badge>
                {session?.user.isAdmin && (
                  <Badge size="sm" variant="solid" action="success">
                    <BadgeText fontSize="$xs">ADMIN</BadgeText>
                  </Badge>
                )}
              </HStack>
            </Box>

            {/* Controls */}
            <HStack space="sm" alignItems="center">
              <Button
                size="sm"
                action="negative"
                variant="outline"
                onPress={logout}
              >
                <ButtonText fontSize="$sm">Logout</ButtonText>
              </Button>
            </HStack>
          </HStack>

          {/* Location Sharing Toggle */}
          <Box
            mt="$3"
            pt="$3"
            borderTopWidth={1}
            borderTopColor="$borderLight100"
          >
            <LocationShareToggle />
          </Box>
        </Box>

        {/* Warning for no maps */}
        {!MAPS_AVAILABLE && (
          <Box mx="$4" mt="$3">
            <Badge action="warning" variant="solid">
              <BadgeText>
                {Platform.OS === "web"
                  ? "Web: Karten-Platzhalter aktiv"
                  : "react-native-maps nicht verfügbar"}
              </BadgeText>
            </Badge>
          </Box>
        )}

        {/* Map Container */}
        {MAPS_AVAILABLE ? (
          <Box flex={1} position="relative">
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass
              mapType="standard"
            >
              {/* Server-Marker (du & andere, wenn durch RBAC sichtbar) */}
              {visible.map((l) => {
                const isMe =
                  l.userId === session?.user.id ||
                  l.userId === session?.user._id;
                const lastUpdate = new Date(l.point.timestamp).toLocaleString(
                  "de-DE",
                  {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                const companyName = getCompanyName(l.companyId);

                return (
                  <Marker
                    key={`${l.userId}-${l.point.timestamp}`}
                    coordinate={{
                      latitude: l.point.lat,
                      longitude: l.point.lng,
                    }}
                    pinColor={isMe ? "#3b82f6" : "#ef4444"}
                  >
                    <Callout>
                      <View style={{ padding: 10, minWidth: 200 }}>
                        <RNText
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            marginBottom: 8,
                          }}
                        >
                          {l.name || "Unbekannter Nutzer"}
                        </RNText>
                        <View style={{ marginBottom: 4 }}>
                          <RNText style={{ fontSize: 12, color: "#666" }}>
                            🏢 Unternehmen:
                          </RNText>
                          <RNText
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              marginTop: 2,
                            }}
                          >
                            {companyName}
                          </RNText>
                        </View>
                        <View
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: "#e5e7eb",
                          }}
                        >
                          <RNText style={{ fontSize: 11, color: "#999" }}>
                            🕒 Letzte Aktualisierung:
                          </RNText>
                          <RNText
                            style={{
                              fontSize: 12,
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            {lastUpdate}
                          </RNText>
                        </View>
                        {l.point.speed !== null &&
                          l.point.speed !== undefined &&
                          l.point.speed > 0 && (
                            <View style={{ marginTop: 4 }}>
                              <RNText style={{ fontSize: 11, color: "#666" }}>
                                🚗 {Math.round((l.point.speed || 0) * 3.6)} km/h
                              </RNText>
                            </View>
                          )}
                      </View>
                    </Callout>
                  </Marker>
                );
              })}

              {/* Geofences */}
              {Array.isArray(geofences) &&
                geofences.map((g) => (
                  <Circle
                    key={`gf-${g.id}`}
                    center={{ latitude: g.lat, longitude: g.lng }}
                    radius={g.radius}
                    strokeColor="rgba(59, 130, 246, 0.8)"
                    fillColor="rgba(59, 130, 246, 0.2)"
                    strokeWidth={2}
                  />
                ))}

              {/* Fallback: falls (noch) kein Server-Marker für mich existiert, zeige lokalen Marker */}
              {!visible.some(
                (v) =>
                  v.userId === session?.user.id ||
                  v.userId === session?.user._id
              ) &&
                myLoc && (
                  <Marker
                    coordinate={{ latitude: myLoc.lat, longitude: myLoc.lng }}
                    pinColor="#3b82f6"
                  >
                    <Callout>
                      <View style={{ padding: 10, minWidth: 200 }}>
                        <RNText
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            marginBottom: 8,
                          }}
                        >
                          {userName}
                        </RNText>
                        <View style={{ marginBottom: 4 }}>
                          <RNText style={{ fontSize: 12, color: "#666" }}>
                            🏢 Unternehmen:
                          </RNText>
                          <RNText
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              marginTop: 2,
                            }}
                          >
                            {getCompanyName(
                              session?.user.company ||
                                session?.user.companyId ||
                                ""
                            )}
                          </RNText>
                        </View>
                        <View
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: "#e5e7eb",
                          }}
                        >
                          <RNText style={{ fontSize: 11, color: "#999" }}>
                            {usingFallback
                              ? "📍 Lokale Position (Fallback)"
                              : "📍 Aktuelle Position"}
                          </RNText>
                        </View>
                      </View>
                    </Callout>
                  </Marker>
                )}
            </MapView>

            {/* Map Controls */}
            <Box position="absolute" right={16} bottom={20}>
              {/* Center on Me Button */}
              <Pressable onPress={centerOnMe} style={styles.mapButton}>
                <RNText style={styles.mapButtonIcon}>📍</RNText>
              </Pressable>
            </Box>

            {/* Status Indicator */}
            {(usingServer || usingFallback) && (
              <Box
                position="absolute"
                left={16}
                bottom={20}
                bg="$white"
                px="$3"
                py="$2"
                borderRadius="$lg"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.2}
                shadowRadius={4}
                elevation={3}
              >
                <HStack space="xs" alignItems="center">
                  <Box
                    w={8}
                    h={8}
                    borderRadius="$full"
                    bg={usingServer ? "$green500" : "$amber500"}
                  />
                  <Text fontSize="$xs" color="$textLight700">
                    {usingServer ? "Live-Tracking" : "Lokales GPS"}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Visible Locations Count */}
            {visible.length > 0 && (
              <Box
                position="absolute"
                top={16}
                left={16}
                bg="$white"
                px="$3"
                py="$2"
                borderRadius="$lg"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.2}
                shadowRadius={4}
                elevation={3}
              >
                <Text
                  fontSize="$xs"
                  fontWeight="$semibold"
                  color="$textLight700"
                >
                  {visible.length}{" "}
                  {visible.length === 1 ? "Tracker" : "Tracker"} sichtbar
                </Text>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            flex={1}
            bg="$backgroundLight50"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$lg" color="$textLight600">
              🗺️
            </Text>
            <Text fontSize="$md" color="$textLight600" mt="$2">
              Karten-Platzhalter
            </Text>
            <Text fontSize="$sm" color="$textLight500" mt="$1">
              react-native-maps nicht verfügbar
            </Text>
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  mapButton: {
    backgroundColor: "white",
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  mapButtonIcon: {
    fontSize: 24,
  },
});
