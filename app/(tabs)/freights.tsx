import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Divider,
  Heading,
  HStack,
  Pressable,
  RefreshControl,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import {
  BookingStatus,
  type Freight,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  isInMotion,
} from "../types/freight";

export default function FreightsScreen() {
  const { session } = useAuth();
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "in_motion">("all");

  const loadFreights = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log("📦 Loading freights...");
      const res = await api.get("/freights");
      console.log("✅ Freights loaded:", res.data?.length || 0);

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setFreights(data);
    } catch (e: any) {
      console.error("❌ Error loading freights:", e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Fehler beim Laden der Frachten"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFreights();
  }, []);

  const filteredFreights = freights.filter((f) => {
    if (filter === "active") {
      return f.isActive && f?.booking?.status !== BookingStatus.DONE;
    }
    if (filter === "in_motion") {
      return isInMotion(f);
    }
    return true;
  });

  const inMotionCount = freights.filter(isInMotion).length;
  const activeCount = freights.filter(
    (f) => f.isActive && f?.booking?.status !== BookingStatus.DONE
  ).length;

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      edges={["top"]}
    >
      <Box flex={1} bg="$backgroundLight0">
        {/* Header */}
        <Box
          px="$4"
          py="$4"
          bg="$white"
          borderBottomWidth={1}
          borderBottomColor="$borderLight200"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={4}
          elevation={2}
        >
          <VStack space="md">
            <Heading size="xl" color="$textLight900">
              🚚 Frachten
            </Heading>

            {/* Clickable Statistics / Filter */}
            <HStack space="sm">
              <Pressable onPress={() => setFilter("all")} flex={1}>
                <Box
                  flex={1}
                  bg={filter === "all" ? "$blue600" : "$blue50"}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={2}
                  borderColor={filter === "all" ? "$blue600" : "$blue200"}
                  shadowColor={filter === "all" ? "$blue600" : "$black"}
                  shadowOffset={{ width: 0, height: filter === "all" ? 3 : 1 }}
                  shadowOpacity={filter === "all" ? 0.3 : 0.1}
                  shadowRadius={filter === "all" ? 6 : 2}
                  elevation={filter === "all" ? 4 : 1}
                >
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={filter === "all" ? "$white" : "$blue600"}
                  >
                    {freights.length}
                  </Text>
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={filter === "all" ? "$blue100" : "$blue700"}
                  >
                    Gesamt
                  </Text>
                </Box>
              </Pressable>

              <Pressable onPress={() => setFilter("in_motion")} flex={1}>
                <Box
                  flex={1}
                  bg={filter === "in_motion" ? "$green600" : "$green50"}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={2}
                  borderColor={
                    filter === "in_motion" ? "$green600" : "$green200"
                  }
                  shadowColor={filter === "in_motion" ? "$green600" : "$black"}
                  shadowOffset={{
                    width: 0,
                    height: filter === "in_motion" ? 3 : 1,
                  }}
                  shadowOpacity={filter === "in_motion" ? 0.3 : 0.1}
                  shadowRadius={filter === "in_motion" ? 6 : 2}
                  elevation={filter === "in_motion" ? 4 : 1}
                >
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={filter === "in_motion" ? "$white" : "$green600"}
                  >
                    {inMotionCount}
                  </Text>
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={filter === "in_motion" ? "$green100" : "$green700"}
                  >
                    Unterwegs
                  </Text>
                </Box>
              </Pressable>

              <Pressable onPress={() => setFilter("active")} flex={1}>
                <Box
                  flex={1}
                  bg={filter === "active" ? "$amber600" : "$amber50"}
                  borderRadius="$lg"
                  p="$3"
                  borderWidth={2}
                  borderColor={filter === "active" ? "$amber600" : "$amber200"}
                  shadowColor={filter === "active" ? "$amber600" : "$black"}
                  shadowOffset={{
                    width: 0,
                    height: filter === "active" ? 3 : 1,
                  }}
                  shadowOpacity={filter === "active" ? 0.3 : 0.1}
                  shadowRadius={filter === "active" ? 6 : 2}
                  elevation={filter === "active" ? 4 : 1}
                >
                  <Text
                    fontSize="$2xl"
                    fontWeight="$bold"
                    color={filter === "active" ? "$white" : "$amber600"}
                  >
                    {activeCount}
                  </Text>
                  <Text
                    fontSize="$xs"
                    fontWeight="$semibold"
                    color={filter === "active" ? "$amber100" : "$amber700"}
                  >
                    Aktiv
                  </Text>
                </Box>
              </Pressable>
            </HStack>
          </VStack>
        </Box>

        {/* Content */}
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadFreights(true)}
            />
          }
        >
          <VStack space="md" p="$4" pb="$8">
            {loading ? (
              <Box py="$8" alignItems="center">
                <Spinner size="large" color="$blue600" />
                <Text mt="$4" color="$textLight600">
                  Frachten werden geladen...
                </Text>
              </Box>
            ) : error ? (
              <Box
                bg="$red50"
                borderWidth={1}
                borderColor="$red300"
                borderRadius="$lg"
                p="$4"
              >
                <Text color="$red600" fontWeight="$semibold">
                  ❌ Fehler
                </Text>
                <Text color="$red600" fontSize="$sm" mt="$1">
                  {error}
                </Text>
                <Button
                  mt="$3"
                  size="sm"
                  variant="outline"
                  action="negative"
                  onPress={() => loadFreights()}
                >
                  <ButtonText>Erneut versuchen</ButtonText>
                </Button>
              </Box>
            ) : filteredFreights.length === 0 ? (
              <Box py="$8" alignItems="center">
                <Text fontSize="$4xl" mb="$2">
                  📦
                </Text>
                <Text
                  fontSize="$lg"
                  fontWeight="$semibold"
                  color="$textLight900"
                >
                  Keine Frachten
                </Text>
                <Text
                  fontSize="$sm"
                  color="$textLight600"
                  textAlign="center"
                  mt="$1"
                >
                  {filter === "all"
                    ? "Es sind noch keine Frachten vorhanden"
                    : filter === "active"
                    ? "Keine aktiven Frachten"
                    : "Keine Frachten unterwegs"}
                </Text>
              </Box>
            ) : (
              filteredFreights.map((freight) => (
                <FreightCard key={freight._id} freight={freight} />
              ))
            )}
          </VStack>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

// Freight Card Component
function FreightCard({ freight }: { freight: Freight }) {
  const inMotion = isInMotion(freight);
  const statusColor = getStatusColor(freight?.booking?.status);
  const statusLabel = getStatusLabel(freight?.booking?.status);
  const statusIcon = getStatusIcon(freight?.booking?.status);

  const formattedDate = new Date(freight.date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(freight.price);

  return (
    <Pressable
      onPress={() => {
        // TODO: Navigation zu Freight-Details
        console.log("Freight clicked:", freight._id);
      }}
    >
      <Box
        bg="$white"
        borderRadius="$xl"
        p="$4"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: inMotion ? 4 : 2 }}
        shadowOpacity={inMotion ? 0.2 : 0.1}
        shadowRadius={inMotion ? 8 : 4}
        elevation={inMotion ? 4 : 2}
        borderWidth={inMotion ? 2 : 1}
        borderColor={inMotion ? "$green500" : "$borderLight200"}
        position="relative"
      >
        {/* In Motion Badge */}
        {inMotion && (
          <Box
            position="absolute"
            top={-8}
            right={16}
            bg="$green600"
            px="$3"
            py="$1"
            borderRadius="$full"
            shadowColor="$green600"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.4}
            shadowRadius={4}
            elevation={3}
          >
            <HStack space="xs" alignItems="center">
              <Text fontSize="$sm" color="$white">
                🚚
              </Text>
              <Text fontSize="$xs" fontWeight="$bold" color="$white">
                UNTERWEGS
              </Text>
            </HStack>
          </Box>
        )}

        <VStack space="md">
          {/* Header: Route & Status */}
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space="xs">
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$lg">📍</Text>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight900">
                    {freight?.start?.city || "Unbekannt"}
                  </Text>
                </HStack>
                <HStack space="xs" alignItems="center" ml="$6">
                  <Text fontSize="$sm" color="$textLight500">
                    →
                  </Text>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$lg">🎯</Text>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight900">
                    {freight?.destination?.city || "Unbekannt"}
                  </Text>
                </HStack>
              </VStack>

              <Badge
                variant="solid"
                action={statusColor.replace("$", "").replace("600", "") as any}
                size="md"
              >
                <BadgeText fontSize="$xs">
                  {statusIcon} {statusLabel.toUpperCase()}
                </BadgeText>
              </Badge>
            </HStack>

            {/* Distance */}
            {freight.distance && (
              <HStack space="xs" alignItems="center">
                <Text fontSize="$xs" color="$textLight600">
                  📏 {Math.round(freight.distance)} km
                </Text>
              </HStack>
            )}
          </VStack>

          <Divider />

          {/* Details */}
          <HStack space="md" flexWrap="wrap">
            <InfoBadge icon="🚛" label={freight?.details?.truckType || "N/A"} />
            <InfoBadge icon="📦" label={freight?.details?.goodsType || "N/A"} />
            <InfoBadge
              icon="📊"
              label={`${freight?.details?.availableVolume || 0}m³`}
            />
          </HStack>

          <Divider />

          {/* Footer: Date & Price */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="$xs" color="$textLight600">
                Datum
              </Text>
              <Text fontSize="$sm" fontWeight="$semibold" color="$textLight900">
                📅 {formattedDate}
              </Text>
            </VStack>

            <VStack alignItems="flex-end">
              <Text fontSize="$xs" color="$textLight600">
                {freight.priceType}
              </Text>
              <Text fontSize="$lg" fontWeight="$bold" color="$green600">
                {formattedPrice}
              </Text>
            </VStack>
          </HStack>

          {/* User Info */}
          {freight?.user && (
            <Box
              bg="$backgroundLight50"
              borderRadius="$lg"
              p="$2"
              borderWidth={1}
              borderColor="$borderLight100"
            >
              <Text fontSize="$xs" color="$textLight600">
                Erstellt von:{" "}
                <Text fontWeight="$semibold" color="$textLight900">
                  {freight.user.firstName} {freight.user.lastName}
                </Text>
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
}

// Info Badge Component
function InfoBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <HStack
      space="xs"
      alignItems="center"
      bg="$backgroundLight50"
      px="$2"
      py="$1"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderLight200"
    >
      <Text fontSize="$sm">{icon}</Text>
      <Text fontSize="$xs" color="$textLight700">
        {label}
      </Text>
    </HStack>
  );
}
