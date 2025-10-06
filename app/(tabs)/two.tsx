import { Text, View } from "@/components/Themed";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { router, type Href } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { session, logout } = useAuth();

  const goAdmin = () => {
    const href = "/admin" as Href; // wird von typedRoutes akzeptiert, wenn admin.tsx existiert
    router.push(href);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text>Benutzer: {session?.user.name}</Text>
      <Text>Rollen: {session?.user.roles.join(", ")}</Text>
      <Text>Firma: {session?.user.companyId}</Text>

      <Button mt="$4" onPress={goAdmin}>
        <ButtonText>Admin öffnen</ButtonText>
      </Button>
      <Button mt="$4" action="negative" onPress={logout}>
        <ButtonText>Logout</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});
