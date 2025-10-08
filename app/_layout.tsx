// app/_layout.tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

// Providers
import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../app/contexts/AuthContext";
import { CompanyProvider } from "../app/contexts/CompanyContext";
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
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationWrapper>
            <CompanyProvider>
              <LocationProvider>
                <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                  <Stack>
                    <Stack.Screen
                      name="login"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="register"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="clear-storage"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="admin" options={{ title: "Admin" }} />
                    <Stack.Screen
                      name="modal"
                      options={{ presentation: "modal", title: "Info" }}
                    />
                  </Stack>
                </ThemeProvider>
              </LocationProvider>
            </CompanyProvider>
          </NavigationWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}

// Navigation Guard Component
function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setNavigationReady] = React.useState(false);

  React.useEffect(() => {
    setNavigationReady(true);
  }, []);

  React.useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "admin" ||
      segments[0] === "modal";

    console.log("Navigation Check:", {
      hasSession: !!session,
      inAuthGroup,
      segments,
    });

    if (!session && inAuthGroup) {
      // Nicht eingeloggt aber auf geschützter Route -> Login
      console.log("Redirecting to login - no session");
      router.replace("/login" as any);
    } else if (
      session &&
      (segments[0] === "login" || segments[0] === "register")
    ) {
      // Eingeloggt aber auf Login/Register -> App
      console.log("Redirecting to app - has session");
      router.replace("/(tabs)" as any);
    }
  }, [session, segments, isNavigationReady]);

  return <>{children}</>;
}
