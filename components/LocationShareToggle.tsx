import { useLocationSharing } from "@/app/contexts/LocationContext";
import { HStack, Switch, Text, VStack } from "@gluestack-ui/themed";
import React from "react";

export default function LocationShareToggle() {
  const { sharing, setSharing, background, setBackground } =
    useLocationSharing();

  return (
    <VStack space="sm">
      {/* Foreground Tracking */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="$3"
        py="$2"
        borderRadius="$lg"
        bg={sharing ? "$blue50" : "$backgroundLight50"}
        borderWidth={1}
        borderColor={sharing ? "$blue200" : "$borderLight200"}
      >
        <HStack space="sm" alignItems="center" flex={1}>
          <Text fontSize="$md">📍</Text>
          <VStack flex={1}>
            <Text fontSize="$sm" fontWeight="$medium" color="$textLight900">
              Live-Tracking
            </Text>
            <Text fontSize="$xs" color="$textLight600">
              Standort in Echtzeit teilen
            </Text>
          </VStack>
        </HStack>
        <HStack space="sm" alignItems="center">
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color={sharing ? "$blue600" : "$textLight500"}
          >
            {sharing ? "EIN" : "AUS"}
          </Text>
          <Switch value={sharing} onValueChange={setSharing} />
        </HStack>
      </HStack>

      {/* Background Tracking */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="$3"
        py="$2"
        borderRadius="$lg"
        bg={background ? "$green50" : "$backgroundLight50"}
        borderWidth={1}
        borderColor={background ? "$green200" : "$borderLight200"}
      >
        <HStack space="sm" alignItems="center" flex={1}>
          <Text fontSize="$md">🔄</Text>
          <VStack flex={1}>
            <Text fontSize="$sm" fontWeight="$medium" color="$textLight900">
              Hintergrund-Tracking
            </Text>
            <Text fontSize="$xs" color="$textLight600">
              Auch wenn App geschlossen ist
            </Text>
          </VStack>
        </HStack>
        <HStack space="sm" alignItems="center">
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color={background ? "$green600" : "$textLight500"}
          >
            {background ? "EIN" : "AUS"}
          </Text>
          <Switch value={background} onValueChange={setBackground} />
        </HStack>
      </HStack>
    </VStack>
  );
}
