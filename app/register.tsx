import FormTextInput from "@/components/ui/FormTextInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import {
  Box,
  Button,
  ButtonText,
  Center,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckIcon,
  ChevronDownIcon,
  Heading,
  HStack,
  KeyboardAvoidingView,
  Link,
  LinkText,
  Pressable,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform } from "react-native";
import { api } from "./services/api";
import type { RegisterData, Role } from "./types/auth";

export default function RegisterScreen() {
  // Persönliche Daten
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Firmen- und Rollendaten
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<Role>("driver");
  const [industry, setIndustry] = useState("");
  const [usagePurpose, setUsagePurpose] = useState("");

  // Adresse
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [country, setCountry] = useState("Deutschland");

  // Zustimmungen
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validierung
      if (password !== confirmPassword) {
        setError("Passwörter stimmen nicht überein");
        return;
      }

      if (!agreedToTerms || !agreedToPrivacy) {
        setError(
          "Bitte stimmen Sie den Nutzungsbedingungen und Datenschutzrichtlinien zu"
        );
        return;
      }

      const registerData: RegisterData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        username,
        company,
        role,
        industry,
        usagePurpose,
        address: {
          street,
          houseNumber,
          zip,
          city,
          district,
          country,
        },
        agreedToTerms,
        agreedToPrivacy,
      };

      await api.post("/users", registerData);

      // Erfolgreiche Registrierung
      router.replace("/login" as any);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid =
    firstName &&
    lastName &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;
  const isStep2Valid =
    company && street && houseNumber && zip && city && district && country;
  const isStep3Valid = agreedToTerms && agreedToPrivacy;

  const renderStep1 = () => (
    <VStack space="md" w="100%">
      <Heading size="lg" mb="$2">
        Persönliche Daten
      </Heading>

      <HStack space="sm">
        <Box flex={1}>
          <FormTextInput
            label="Vorname *"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Max"
            autoCapitalize="words"
          />
        </Box>
        <Box flex={1}>
          <FormTextInput
            label="Nachname *"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Mustermann"
            autoCapitalize="words"
          />
        </Box>
      </HStack>

      <FormTextInput
        label="E-Mail *"
        value={email}
        onChangeText={setEmail}
        placeholder="max.mustermann@firma.de"
        autoCapitalize="none"
      />

      <FormTextInput
        label="Telefonnummer"
        value={phone}
        onChangeText={setPhone}
        placeholder="+49 123 456789"
      />

      <FormTextInput
        label="Benutzername (optional)"
        value={username}
        onChangeText={setUsername}
        placeholder="maxmuster123"
        autoCapitalize="none"
      />

      <FormTextInput
        label="Passwort *"
        value={password}
        onChangeText={setPassword}
        placeholder="Mindestens 8 Zeichen"
        secureTextEntry
      />

      <FormTextInput
        label="Passwort bestätigen *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Passwort wiederholen"
        secureTextEntry
      />

      {password && confirmPassword && password !== confirmPassword && (
        <Text color="$red600" size="sm">
          Passwörter stimmen nicht überein
        </Text>
      )}

      <Button
        onPress={() => setCurrentStep(2)}
        isDisabled={!isStep1Valid}
        bg="$blue600"
        mt="$4"
      >
        <ButtonText>Weiter</ButtonText>
      </Button>
    </VStack>
  );

  const renderStep2 = () => (
    <VStack space="md" w="100%">
      <Heading size="lg" mb="$2">
        Firmen- & Adressdaten
      </Heading>

      <FormTextInput
        label="Firmenname *"
        value={company}
        onChangeText={setCompany}
        placeholder="Muster GmbH"
        autoCapitalize="words"
      />

      <Box>
        <Text fontSize="$sm" fontWeight="$medium" mb="$2" color="$textLight700">
          Rolle *
        </Text>
        <Select
          selectedValue={role}
          onValueChange={(value) => setRole(value as Role)}
        >
          <SelectTrigger>
            <SelectInput placeholder="Rolle auswählen" />
            <SelectIcon mr="$3">
              <ChevronDownIcon />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectItem label="Fahrer" value="driver" />
              <SelectItem label="Carrier/Spediteur" value="carrier" />
              <SelectItem label="Lieferant" value="supplier" />
              <SelectItem label="Lager" value="warehouse" />
              <SelectItem label="Administrator" value="admin" />
            </SelectContent>
          </SelectPortal>
        </Select>
      </Box>

      <FormTextInput
        label="Branche"
        value={industry}
        onChangeText={setIndustry}
        placeholder="Logistik, Transport, etc."
      />

      <FormTextInput
        label="Verwendungszweck"
        value={usagePurpose}
        onChangeText={setUsagePurpose}
        placeholder="Flottenmanagement, Tracking, etc."
      />

      <Heading size="sm" mt="$4" mb="$2">
        Adresse
      </Heading>

      <HStack space="sm">
        <Box flex={3}>
          <FormTextInput
            label="Straße *"
            value={street}
            onChangeText={setStreet}
            placeholder="Musterstraße"
          />
        </Box>
        <Box flex={1}>
          <FormTextInput
            label="Nr. *"
            value={houseNumber}
            onChangeText={setHouseNumber}
            placeholder="123"
          />
        </Box>
      </HStack>

      <HStack space="sm">
        <Box flex={1}>
          <FormTextInput
            label="PLZ *"
            value={zip}
            onChangeText={setZip}
            placeholder="12345"
          />
        </Box>
        <Box flex={2}>
          <FormTextInput
            label="Stadt *"
            value={city}
            onChangeText={setCity}
            placeholder="Berlin"
          />
        </Box>
      </HStack>

      <FormTextInput
        label="Bezirk/Region *"
        value={district}
        onChangeText={setDistrict}
        placeholder="Mitte"
      />

      <FormTextInput
        label="Land *"
        value={country}
        onChangeText={setCountry}
        placeholder="Deutschland"
      />

      <HStack space="sm" mt="$4">
        <Button onPress={() => setCurrentStep(1)} variant="outline" flex={1}>
          <ButtonText>Zurück</ButtonText>
        </Button>
        <Button
          onPress={() => setCurrentStep(3)}
          isDisabled={!isStep2Valid}
          bg="$blue600"
          flex={1}
        >
          <ButtonText>Weiter</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );

  const renderStep3 = () => (
    <VStack space="md" w="100%">
      <Heading size="lg" mb="$2">
        Nutzungsbedingungen
      </Heading>

      <Box
        borderWidth={1}
        borderColor="$borderLight200"
        borderRadius="$lg"
        p="$4"
        bg="$backgroundLight50"
      >
        <Checkbox
          value=""
          isChecked={agreedToTerms}
          onChange={setAgreedToTerms}
        >
          <CheckboxIndicator mr="$2">
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          <CheckboxLabel>
            <Text size="sm">
              Ich stimme den{" "}
              <Link href="#">
                <LinkText color="$blue600">Nutzungsbedingungen</LinkText>
              </Link>{" "}
              zu *
            </Text>
          </CheckboxLabel>
        </Checkbox>
      </Box>

      <Box
        borderWidth={1}
        borderColor="$borderLight200"
        borderRadius="$lg"
        p="$4"
        bg="$backgroundLight50"
      >
        <Checkbox
          value=""
          isChecked={agreedToPrivacy}
          onChange={setAgreedToPrivacy}
        >
          <CheckboxIndicator mr="$2">
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          <CheckboxLabel>
            <Text size="sm">
              Ich habe die{" "}
              <Link href="#">
                <LinkText color="$blue600">Datenschutzerklärung</LinkText>
              </Link>{" "}
              gelesen und stimme zu *
            </Text>
          </CheckboxLabel>
        </Checkbox>
      </Box>

      <Box
        borderWidth={1}
        borderColor="$amber200"
        borderRadius="$lg"
        p="$4"
        bg="$amber50"
        mt="$2"
      >
        <Text size="sm" color="$textLight700">
          ℹ️ Nach der Registrierung muss Ihr Account von einem Administrator
          genehmigt werden, bevor Sie sich anmelden können.
        </Text>
      </Box>

      {error && (
        <Box
          borderWidth={1}
          borderColor="$red300"
          borderRadius="$lg"
          p="$4"
          bg="$red50"
        >
          <Text color="$red600">{error}</Text>
        </Box>
      )}

      <HStack space="sm" mt="$4">
        <Button onPress={() => setCurrentStep(2)} variant="outline" flex={1}>
          <ButtonText>Zurück</ButtonText>
        </Button>
        <PrimaryButton
          onPress={handleRegister}
          isDisabled={!isStep3Valid || loading}
          flex={1}
          bg="$green600"
        >
          {loading ? "Wird registriert..." : "Registrieren"}
        </PrimaryButton>
      </HStack>

      <Center mt="$6">
        <Text size="sm" color="$textLight600">
          Bereits registriert?{" "}
          <Link onPress={() => router.push("/login" as any)}>
            <LinkText color="$blue600" fontWeight="$semibold">
              Zum Login
            </LinkText>
          </Link>
        </Text>
      </Center>
    </VStack>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center flex={1} px="$6" py="$8" bg="$backgroundLight0">
          <VStack w="100%" maxWidth={480} space="lg">
            {/* Back Button */}
            <HStack w="100%" justifyContent="flex-start" mt="$2">
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$xl" color="$blue600">
                    ←
                  </Text>
                  <Text color="$blue600" fontSize="$sm" fontWeight="$medium">
                    Zurück zum Login
                  </Text>
                </HStack>
              </Pressable>
            </HStack>

            {/* Header */}
            <VStack space="sm" alignItems="center" mb="$4">
              <Heading size="2xl" textAlign="center" color="$blue600">
                Connect Logistics
              </Heading>
              <Text size="md" textAlign="center" color="$textLight600">
                Erstellen Sie Ihren Account
              </Text>
            </VStack>

            {/* Progress Indicator */}
            <HStack space="sm" justifyContent="center" mb="$4">
              <Box
                w={60}
                h={4}
                borderRadius="$full"
                bg={currentStep >= 1 ? "$blue600" : "$backgroundLight300"}
              />
              <Box
                w={60}
                h={4}
                borderRadius="$full"
                bg={currentStep >= 2 ? "$blue600" : "$backgroundLight300"}
              />
              <Box
                w={60}
                h={4}
                borderRadius="$full"
                bg={currentStep >= 3 ? "$blue600" : "$backgroundLight300"}
              />
            </HStack>

            {/* Content Card */}
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
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </Box>
          </VStack>
        </Center>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
