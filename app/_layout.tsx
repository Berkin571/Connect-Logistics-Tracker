// app/_layout.tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

// Providers
import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../app/contexts/AuthContext";
import { LocationProvider } from "../app/contexts/LocationContext";

// Tasks (Side-Effect Registrations)
// import "@/tasks/bgLocationTask";
// import "@/tasks/geofenceTask";

export { ErrorBoundary } from "expo-router";
export const unstable_settings = { initialRouteName: "login" };

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) {
    // Wichtig: vor Rückgabe KEINE weiteren Hooks mehr aufrufen
    return null;
  }

  // Ab hier KEINE neuen Hooks hinzufügen – nur Delegieren
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Dieser Hook wird jetzt in JEDER Renderphase der Komponente aufgerufen
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="admin" options={{ title: "Admin" }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Info" }}
                />
              </Stack>
            </ThemeProvider>
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
