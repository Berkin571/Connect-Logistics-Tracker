import FormTextInput from "@/components/ui/FormTextInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Center, Heading, Text, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("driver@example.com");
  const [password, setPassword] = useState("secret");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center flex={1} px="$4">
      <VStack w="100%" maxWidth={420} space="lg">
        <Heading textAlign="center">Anmeldung</Heading>
        <FormTextInput
          label="E-Mail"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
        />
        <FormTextInput
          label="Passwort"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        {error && <Text color="$red600">{error}</Text>}
        <PrimaryButton onPress={onSubmit} isDisabled={loading}>
          {loading ? "Bitte warten…" : "Einloggen"}
        </PrimaryButton>
      </VStack>
    </Center>
  );
}
