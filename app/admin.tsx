import {
  Badge,
  BadgeText,
  Box,
  Heading,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { getSocket } from "./services/socket";
import type { GeofenceEvent, LocationUpdatePayload } from "./types/location";

export default function AdminScreen() {
  const [list, setList] = useState<LocationUpdatePayload[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);

  useEffect(() => {
    (async () => {
      const socket = await getSocket();
      socket.on("locations:visible", (l: any) => setList(l));
      socket.on("geofence:event", (ev: GeofenceEvent) =>
        setEvents((prev) => [ev, ...prev].slice(0, 100))
      );
      socket.emit("locations:subscribe");
      return () => {
        socket.off("locations:visible");
        socket.off("geofence:event");
      };
    })();
  }, []);

  return (
    <ScrollView>
      <Box p="$4">
        <Heading mb="$3">Sichtbare Tracker</Heading>
        <VStack space="md" mb="$6">
          {list.map((l) => (
            <Box
              key={`${l.userId}-${l.point.timestamp}`}
              p="$3"
              borderWidth={1}
              borderRadius="$md"
            >
              <Text>
                User: {l.userId} — Company: {l.companyId}
              </Text>
              <Text>
                Pos: {l.point.lat.toFixed(5)}, {l.point.lng.toFixed(5)}
              </Text>
              <Badge mt="$2" action="info">
                <BadgeText>
                  {new Date(l.point.timestamp).toLocaleString()}
                </BadgeText>
              </Badge>
            </Box>
          ))}
        </VStack>

        <Heading mb="$3">Geofence-Events</Heading>
        <VStack space="md">
          {events.map((ev, idx) => (
            <Box
              key={`${ev.regionId}-${ev.timestamp}-${idx}`}
              p="$3"
              borderWidth={1}
              borderRadius="$md"
            >
              <Text>
                {ev.userId} — {ev.transition.toUpperCase()} — Region:{" "}
                {ev.regionId}
              </Text>
              <Badge mt="$2" action="muted">
                <BadgeText>{new Date(ev.timestamp).toLocaleString()}</BadgeText>
              </Badge>
            </Box>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}
