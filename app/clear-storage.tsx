import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";

/**
 * Emergency Screen zum Löschen aller gespeicherten Daten
 * Aufrufbar über: /clear-storage
 */
export default function ClearStorageScreen() {
  const [cleared, setCleared] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearAllData = async () => {
    try {
      setLoading(true);

      // Alle SecureStore Items löschen
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("user");

      setCleared(true);

      // Nach 2 Sekunden zum Login weiterleiten
      setTimeout(() => {
        router.replace("/login" as any);
      }, 2000);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center flex={1} px="$6" bg="$backgroundLight0">
      <VStack w="100%" maxWidth={420} space="lg" alignItems="center">
        <Box
          w={80}
          h={80}
          borderRadius="$full"
          bg="$red600"
          alignItems="center"
          justifyContent="center"
          mb="$4"
        >
          <Text fontSize={40} color="$white">
            🗑️
          </Text>
        </Box>

        <Heading size="xl" textAlign="center" color="$textLight900">
          Speicher löschen
        </Heading>

        {!cleared ? (
          <>
            <Text textAlign="center" color="$textLight600">
              Dies löscht alle gespeicherten Login-Daten und Sessions. Danach
              müssen Sie sich neu anmelden.
            </Text>

            <Box
              w="100%"
              p="$4"
              borderRadius="$lg"
              bg="$amber50"
              borderWidth={1}
              borderColor="$amber200"
            >
              <Text fontSize="$sm" color="$amber900" fontWeight="$semibold">
                ⚠️ Warnung
              </Text>
              <Text fontSize="$xs" color="$amber800" mt="$1">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </Text>
            </Box>

            <VStack space="sm" w="100%" mt="$4">
              <Button
                onPress={clearAllData}
                isDisabled={loading}
                bg="$red600"
                size="lg"
              >
                <ButtonText>
                  {loading ? "Wird gelöscht..." : "Alle Daten löschen"}
                </ButtonText>
              </Button>

              <Button onPress={() => router.back()} variant="outline" size="lg">
                <ButtonText>Abbrechen</ButtonText>
              </Button>
            </VStack>
          </>
        ) : (
          <>
            <Box
              w="100%"
              p="$4"
              borderRadius="$lg"
              bg="$green50"
              borderWidth={1}
              borderColor="$green200"
            >
              <Text
                fontSize="$md"
                color="$green900"
                fontWeight="$semibold"
                textAlign="center"
              >
                ✅ Erfolgreich gelöscht!
              </Text>
              <Text fontSize="$sm" color="$green800" mt="$2" textAlign="center">
                Sie werden zum Login weitergeleitet...
              </Text>
            </Box>
          </>
        )}
      </VStack>
    </Center>
  );
}
