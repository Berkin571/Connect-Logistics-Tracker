import { useLocationSharing } from "@/app/contexts/LocationContext";
import { HStack, Switch, Text, VStack } from "@gluestack-ui/themed";
import React from "react";

export default function LocationShareToggle() {
  const { sharing, setSharing, background, setBackground } =
    useLocationSharing();

  return (
    <VStack space="sm">
      <HStack alignItems="center" space="md">
        <Text>Foreground</Text>
        <Switch value={sharing} onValueChange={setSharing} />
        <Text>{sharing ? "EIN" : "AUS"}</Text>
      </HStack>
      <HStack alignItems="center" space="md">
        <Text>Background</Text>
        <Switch value={background} onValueChange={setBackground} />
        <Text>{background ? "EIN" : "AUS"}</Text>
      </HStack>
    </VStack>
  );
}
