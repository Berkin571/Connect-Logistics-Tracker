import FormTextInput from "@/components/ui/FormTextInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import {
  Box,
  Center,
  Heading,
  HStack,
  KeyboardAvoidingView,
  Link,
  LinkText,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform } from "react-native";
import { useAuth } from "./contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        setError("Bitte E-Mail und Passwort eingeben");
        return;
      }

      console.log("🔐 Login-Versuch für:", email);
      await login(email, password);
      console.log("✅ Login erfolgreich!");
      router.replace("/(tabs)");
    } catch (e: any) {
      console.error("❌ Login-Fehler:", e);
      console.error("Response:", e?.response);
      console.error("Response Data:", e?.response?.data);
      console.error("Status:", e?.response?.status);

      let errorMsg = "Login fehlgeschlagen.";

      if (e?.response?.status === 401) {
        errorMsg = "E-Mail oder Passwort falsch.";
      } else if (e?.response?.status === 403) {
        errorMsg =
          "Ihr Account muss noch von einem Administrator genehmigt werden.";
      } else if (e?.response?.data?.message) {
        errorMsg = e.response.data.message;
      } else if (e?.response?.data?.error) {
        errorMsg = e.response.data.error;
      } else if (e?.message === "Network Error" || e?.code === "ECONNREFUSED") {
        errorMsg = "Backend nicht erreichbar. Läuft der Server auf Port 5001?";
      } else if (e?.message) {
        errorMsg = e.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center flex={1} px="$6" py="$8" bg="$backgroundLight0">
          <VStack w="100%" maxWidth={420} space="xl">
            {/* Logo/Header Section */}
            <VStack space="sm" alignItems="center" mb="$8">
              <Box
                w={80}
                h={80}
                borderRadius="$full"
                bg="$blue600"
                alignItems="center"
                justifyContent="center"
                mb="$4"
                shadowColor="$blue600"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
                elevation={5}
              >
                <Text fontSize={40} color="$white">
                  🚚
                </Text>
              </Box>
              <Heading size="2xl" textAlign="center" color="$textLight900">
                Connect Logistics
              </Heading>
              <Text size="md" textAlign="center" color="$textLight600">
                Willkommen zurück! Bitte melden Sie sich an.
              </Text>
            </VStack>

            {/* Login Card */}
            <Box
              bg="$white"
              borderRadius="$2xl"
              p="$6"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              elevation={3}
            >
              <VStack space="lg">
                <FormTextInput
                  label="E-Mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ihre.email@firma.de"
                  autoCapitalize="none"
                />

                <FormTextInput
                  label="Passwort"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ihr Passwort"
                  secureTextEntry
                />

                {/* Forgot Password Link */}
                <HStack justifyContent="flex-end">
                  <Link
                    onPress={() => {
                      /* TODO: Implement forgot password */
                    }}
                  >
                    <LinkText color="$blue600" size="sm" fontWeight="$medium">
                      Passwort vergessen?
                    </LinkText>
                  </Link>
                </HStack>

                {/* Error Message */}
                {error && (
                  <Box
                    borderWidth={1}
                    borderColor="$red300"
                    borderRadius="$lg"
                    p="$3"
                    bg="$red50"
                  >
                    <Text color="$red600" size="sm">
                      {error}
                    </Text>
                  </Box>
                )}

                {/* Login Button */}
                <PrimaryButton
                  onPress={onSubmit}
                  isDisabled={loading}
                  bg="$blue600"
                  size="lg"
                  mt="$2"
                  shadowColor="$blue600"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.3}
                  shadowRadius={4}
                  elevation={2}
                >
                  {loading ? "Anmeldung läuft..." : "Anmelden"}
                </PrimaryButton>
              </VStack>
            </Box>

            {/* Register Link */}
            <Center mt="$6">
              <Text size="sm" color="$textLight600">
                Noch kein Account?{" "}
                <Link onPress={() => router.push("/register" as any)}>
                  <LinkText color="$blue600" fontWeight="$semibold">
                    Jetzt registrieren
                  </LinkText>
                </Link>
              </Text>
            </Center>

            {/* Footer */}
            <Center mt="$8">
              <Text size="xs" color="$textLight500">
                © 2025 Connect Logistics
              </Text>
              <Text size="xs" color="$textLight500" mt="$1">
                Alle Rechte vorbehalten
              </Text>
            </Center>
          </VStack>
        </Center>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
