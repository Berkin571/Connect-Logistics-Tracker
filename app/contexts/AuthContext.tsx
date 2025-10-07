import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api";
import { closeSocket, getSocket } from "../services/socket";
import type { Session, User } from "../types/auth";
import { Env } from "../utils/env";

type AuthCtx = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

// Helper-Funktion um User vom Backend zu normalisieren
function normalizeUser(user: any): User {
  return {
    ...user,
    id: user._id || user.id,
    companyId: user.company || user.companyId,
    roles: user.role ? [user.role] : user.roles || [],
    fullName: user.fullName || `${user.firstName} ${user.lastName}`,
  };
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const userJson = await SecureStore.getItemAsync("user");

      if (token && userJson) {
        try {
          const rawUser = JSON.parse(userJson);

          // Validierung: User muss gültige Daten haben
          if (
            !rawUser ||
            !rawUser._id ||
            !rawUser.email ||
            !rawUser.firstName
          ) {
            console.warn("Ungültige User-Daten im SecureStore - wird gelöscht");
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("user");
            return;
          }

          const user = normalizeUser(rawUser);
          setSession({ user, tokens: { accessToken: token } });

          // WebSocket nur bei gültigem Token verbinden
          if (token !== "mock") {
            await getSocket();
          }
        } catch (error) {
          console.error("Fehler beim Laden der Session:", error);
          // Fehler beim Laden der Session - aufräumen
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("user");
        }
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // Backend verwendet /api/v1/users/login
    console.log("📤 Sending login request to:", Env.API_URL);
    console.log("📤 Email:", email);

    const res = await api.post("/users/login", { email, password });

    console.log("📥 Backend Response Status:", res.status);
    console.log("📥 Backend Response Type:", typeof res.data);
    console.log("📥 Backend Response:", JSON.stringify(res.data, null, 2));
    console.log(
      "📥 Response Keys:",
      res.data ? Object.keys(res.data) : "NO DATA"
    );

    const data = res.data;

    // Backend kann verschiedene Formate zurückgeben:
    // Option 1: { accessToken, user }
    // Option 2: { token, user }
    // Option 3: { user, token }
    // Option 4: Direktes User-Objekt mit token darin

    let accessToken: string | undefined;
    let rawUser: any;

    // Token finden
    if (data.accessToken) {
      accessToken = data.accessToken;
    } else if (data.token) {
      accessToken = data.token;
    } else if (data.data?.token) {
      accessToken = data.data.token;
    } else if (data.data?.accessToken) {
      accessToken = data.data.accessToken;
    }

    // User finden
    if (data.user) {
      rawUser = data.user;
    } else if (data.data?.user) {
      rawUser = data.data.user;
    } else if (data.data && !data.user && !data.token && !data.accessToken) {
      // Manchmal ist data.data das User-Objekt
      rawUser = data.data;
    } else if (!data.user && !data.data) {
      // Manchmal ist data direkt das User-Objekt
      rawUser = data;
    }

    console.log(
      "🔑 Extracted Token:",
      accessToken ? "✅ Found" : "❌ Not found"
    );
    console.log("👤 Extracted User:", rawUser ? "✅ Found" : "❌ Not found");
    console.log("👤 User Data:", JSON.stringify(rawUser, null, 2));

    if (!accessToken) {
      console.error("❌ Kein Token gefunden in Response:", data);
      throw new Error(
        "Kein Access Token vom Server erhalten. Prüfe Backend-Response-Format."
      );
    }

    if (!rawUser) {
      console.error("❌ Kein User gefunden in Response:", data);
      throw new Error(
        "Keine Benutzerdaten vom Server erhalten. Prüfe Backend-Response-Format."
      );
    }

    // User-Daten normalisieren
    const user = normalizeUser(rawUser);
    console.log(
      "✅ Normalized User:",
      user.email,
      user.firstName,
      user.lastName
    );

    // Tokens speichern
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("user", JSON.stringify(user));

    setSession({ user, tokens: { accessToken } });

    // WebSocket-Verbindung aufbauen
    await getSocket();
  };

  const logout = async () => {
    try {
      // Session sofort auf null setzen
      setSession(null);

      // WebSocket schließen
      closeSocket();

      // SecureStore aufräumen
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("Fehler beim Logout:", error);
      // Auch bei Fehler Session löschen
      setSession(null);
    }
  };

  const value = useMemo(() => ({ session, login, logout }), [session]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
