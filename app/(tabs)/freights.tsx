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

          {/* Statistics */}
          <HStack space="sm">
            <Box
              flex={1}
              bg="$blue50"
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor="$blue200"
            >
              <Text fontSize="$2xl" fontWeight="$bold" color="$blue600">
                {freights.length}
              </Text>
              <Text fontSize="$xs" color="$blue700">
                Gesamt
              </Text>
            </Box>
            <Box
              flex={1}
              bg="$green50"
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor="$green200"
            >
              <Text fontSize="$2xl" fontWeight="$bold" color="$green600">
                {inMotionCount}
              </Text>
              <Text fontSize="$xs" color="$green700">
                Unterwegs
              </Text>
            </Box>
            <Box
              flex={1}
              bg="$amber50"
              borderRadius="$lg"
              p="$3"
              borderWidth={1}
              borderColor="$amber200"
            >
              <Text fontSize="$2xl" fontWeight="$bold" color="$amber600">
                {activeCount}
              </Text>
              <Text fontSize="$xs" color="$amber700">
                Aktiv
              </Text>
            </Box>
          </HStack>

          {/* Filter Buttons */}
          <HStack space="sm">
            <FilterButton
              label="Alle"
              active={filter === "all"}
              onPress={() => setFilter("all")}
              count={freights.length}
            />
            <FilterButton
              label="Aktiv"
              active={filter === "active"}
              onPress={() => setFilter("active")}
              count={activeCount}
            />
            <FilterButton
              label="Unterwegs"
              active={filter === "in_motion"}
              onPress={() => setFilter("in_motion")}
              count={inMotionCount}
            />
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
              <Text fontSize="$lg" fontWeight="$semibold" color="$textLight900">
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
  );
}

// Filter Button Component
function FilterButton({
  label,
  active,
  onPress,
  count,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count: number;
}) {
  return (
    <Pressable onPress={onPress} flex={1}>
      <Box
        py="$2"
        px="$3"
        borderRadius="$lg"
        bg={active ? "$blue600" : "$white"}
        borderWidth={1}
        borderColor={active ? "$blue600" : "$borderLight200"}
        alignItems="center"
      >
        <Text
          fontSize="$sm"
          fontWeight="$semibold"
          color={active ? "$white" : "$textLight700"}
        >
          {label}
        </Text>
        <Text
          fontSize="$xs"
          color={active ? "$blue100" : "$textLight500"}
          mt="$0.5"
        >
          {count}
        </Text>
      </Box>
    </Pressable>
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
