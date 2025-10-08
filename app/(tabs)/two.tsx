import {
  Avatar,
  AvatarFallbackText,
  Badge,
  BadgeText,
  Box,
  Divider,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useCompanies } from "../contexts/CompanyContext";
import { useLocationSharing } from "../contexts/LocationContext";

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const { sharing, background } = useLocationSharing();
  const { getCompanyName } = useCompanies();

  if (!session) {
    return null;
  }

  const user = session.user;
  const userName = user.fullName || `${user.firstName} ${user.lastName}`;
  const userInitials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();
  const companyName = getCompanyName(user.company || user.companyId || "");

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (confirm("Möchten Sie sich wirklich abmelden?")) {
        await logout();
        router.replace("/login" as any);
      }
    } else {
      Alert.alert("Abmelden", "Möchten Sie sich wirklich abmelden?", [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Abmelden",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login" as any);
          },
        },
      ]);
    }
  };

  const goToAdmin = () => {
    router.push("/admin" as any);
  };

  const goToClearStorage = () => {
    router.push("/clear-storage" as any);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      edges={["top"]}
    >
      <ScrollView flex={1} bg="$backgroundLight0">
        <VStack space="lg" pb="$6">
          {/* Header mit Avatar */}
          <Box
            bg="$blue600"
            pt="$16"
            pb="$8"
            px="$6"
            borderBottomLeftRadius="$3xl"
            borderBottomRightRadius="$3xl"
          >
            <VStack space="md" alignItems="center">
              <Avatar
                size="2xl"
                bg="$blue500"
                borderWidth={4}
                borderColor="$white"
              >
                <AvatarFallbackText>{userName}</AvatarFallbackText>
              </Avatar>
              <VStack space="xs" alignItems="center">
                <Heading size="xl" color="$white">
                  {userName}
                </Heading>
                <Text color="$blue100" fontSize="$sm">
                  {user.email}
                </Text>
                <HStack space="xs" mt="$2">
                  <Badge variant="solid" action="success" size="md">
                    <BadgeText fontSize="$xs">
                      {user.role?.toUpperCase()}
                    </BadgeText>
                  </Badge>
                  {user.isAdmin && (
                    <Badge variant="solid" action="warning" size="md">
                      <BadgeText fontSize="$xs">ADMIN</BadgeText>
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Firmen-Informationen */}
          <VStack space="md" px="$6">
            <Heading size="md" color="$textLight900">
              Firmen-Informationen
            </Heading>

            <Box
              bg="$white"
              borderRadius="$xl"
              p="$4"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
              elevation={2}
            >
              <VStack space="md">
                <HStack space="sm" alignItems="center">
                  <Text fontSize="$2xl">🏢</Text>
                  <VStack flex={1}>
                    <Text fontSize="$xs" color="$textLight600">
                      Unternehmen
                    </Text>
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      color="$textLight900"
                    >
                      {companyName}
                    </Text>
                  </VStack>
                </HStack>
                <Divider />
                <InfoRow label="Rolle" value={user.role || "Keine"} />
                {user.isAdmin && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$sm" color="$textLight600">
                        Administrator
                      </Text>
                      <Badge variant="solid" action="success" size="sm">
                        <BadgeText fontSize="$xs">JA</BadgeText>
                      </Badge>
                    </HStack>
                  </>
                )}
              </VStack>
            </Box>
          </VStack>

          {/* Benutzer-Informationen */}
          <VStack space="md" px="$6">
            <Heading size="md" color="$textLight900">
              Persönliche Informationen
            </Heading>

            <Box
              bg="$white"
              borderRadius="$xl"
              p="$4"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
              elevation={2}
            >
              <VStack space="md">
                <InfoRow label="Vorname" value={user.firstName} />
                <Divider />
                <InfoRow label="Nachname" value={user.lastName} />
                <Divider />
                <InfoRow label="E-Mail" value={user.email} />
                {user.phone && (
                  <>
                    <Divider />
                    <InfoRow label="Telefon" value={user.phone} />
                  </>
                )}
                {user.username && (
                  <>
                    <Divider />
                    <InfoRow label="Benutzername" value={user.username} />
                  </>
                )}
              </VStack>
            </Box>
          </VStack>

          {/* Adresse */}
          {user.address && (
            <VStack space="md" px="$6">
              <Heading size="md" color="$textLight900">
                Adresse
              </Heading>

              <Box
                bg="$white"
                borderRadius="$xl"
                p="$4"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
                elevation={2}
              >
                <VStack space="md">
                  <InfoRow
                    label="Straße"
                    value={`${user.address.street} ${user.address.houseNumber}`}
                  />
                  <Divider />
                  <InfoRow
                    label="PLZ / Stadt"
                    value={`${user.address.zip} ${user.address.city}`}
                  />
                  <Divider />
                  <InfoRow label="Bezirk" value={user.address.district} />
                  <Divider />
                  <InfoRow label="Land" value={user.address.country} />
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Tracking-Status */}
          <VStack space="md" px="$6">
            <Heading size="md" color="$textLight900">
              Tracking-Status
            </Heading>

            <Box
              bg="$white"
              borderRadius="$xl"
              p="$4"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
              elevation={2}
            >
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Text fontSize="$lg">📍</Text>
                    <VStack>
                      <Text
                        fontSize="$sm"
                        fontWeight="$medium"
                        color="$textLight900"
                      >
                        Live-Tracking
                      </Text>
                      <Text fontSize="$xs" color="$textLight600">
                        Echtzeit-Standort teilen
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    variant="solid"
                    action={sharing ? "success" : "muted"}
                    size="sm"
                  >
                    <BadgeText fontSize="$xs">
                      {sharing ? "AKTIV" : "INAKTIV"}
                    </BadgeText>
                  </Badge>
                </HStack>

                <Divider />

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Text fontSize="$lg">🔄</Text>
                    <VStack>
                      <Text
                        fontSize="$sm"
                        fontWeight="$medium"
                        color="$textLight900"
                      >
                        Hintergrund-Tracking
                      </Text>
                      <Text fontSize="$xs" color="$textLight600">
                        Im Hintergrund aktiv
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    variant="solid"
                    action={background ? "success" : "muted"}
                    size="sm"
                  >
                    <BadgeText fontSize="$xs">
                      {background ? "AKTIV" : "INAKTIV"}
                    </BadgeText>
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* Aktionen */}
          <VStack space="md" px="$6">
            <Heading size="md" color="$textLight900">
              Aktionen
            </Heading>

            <VStack space="sm">
              {user.isAdmin && (
                <ActionButton
                  icon="👑"
                  title="Admin-Panel"
                  description="Verwaltungsfunktionen"
                  onPress={goToAdmin}
                  color="$blue600"
                />
              )}

              <ActionButton
                icon="🗑️"
                title="Speicher löschen"
                description="Alle lokalen Daten entfernen"
                onPress={goToClearStorage}
                color="$amber600"
              />

              <ActionButton
                icon="🚪"
                title="Abmelden"
                description="Aus dem Account ausloggen"
                onPress={handleLogout}
                color="$red600"
              />
            </VStack>
          </VStack>

          {/* App-Informationen */}
          <VStack space="md" px="$6" mt="$4">
            <Heading size="sm" color="$textLight700">
              App-Informationen
            </Heading>

            <Box
              bg="$backgroundLight50"
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor="$borderLight200"
            >
              <VStack space="xs">
                <Text fontSize="$xs" color="$textLight600">
                  Connect Logistics Tracker
                </Text>
                <Text fontSize="$xs" color="$textLight600">
                  Version 1.0.0
                </Text>
                <Text fontSize="$xs" color="$textLight600">
                  © 2025 Connect Logistics
                </Text>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontSize="$sm" color="$textLight600" flex={1}>
        {label}
      </Text>
      <Text
        fontSize="$sm"
        color="$textLight900"
        fontWeight="$medium"
        flex={2}
        textAlign="right"
      >
        {value}
      </Text>
    </HStack>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onPress,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable onPress={onPress}>
      <Box
        bg="$white"
        borderRadius="$xl"
        p="$4"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={2}
      >
        <HStack space="md" alignItems="center">
          <Box
            w={48}
            h={48}
            borderRadius="$full"
            bg="$blue50"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>{icon}</Text>
          </Box>
          <VStack flex={1}>
            <Text fontSize="$md" fontWeight="$semibold" color="$textLight900">
              {title}
            </Text>
            <Text fontSize="$xs" color="$textLight600">
              {description}
            </Text>
          </VStack>
          <Text fontSize="$xl" color="$textLight400">
            ›
          </Text>
        </HStack>
      </Box>
    </Pressable>
  );
}
