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

const MOCK = process.env.EXPO_PUBLIC_MOCK_AUTH === "1";

type AuthCtx = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

function makeMockUser(email: string): User {
  const lower = email.toLowerCase();
  const role = lower.startsWith("admin")
    ? "admin"
    : lower.startsWith("carrier")
    ? "carrier"
    : lower.startsWith("supplier")
    ? "supplier"
    : lower.startsWith("warehouse")
    ? "warehouse"
    : "driver";
  const companyId =
    role === "admin" ? "HQ" : role === "supplier" ? "SUP" : "C1";
  return {
    id:
      role === "admin"
        ? "2"
        : role === "carrier"
        ? "3"
        : role === "supplier"
        ? "4"
        : role === "warehouse"
        ? "5"
        : "1",
    name: `${role[0].toUpperCase()}${role.slice(1)} Mock`,
    email,
    companyId,
    roles: [role as User["roles"][number]],
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
        const user: User = JSON.parse(userJson);
        setSession({ user, tokens: { accessToken: token } });
        if (!MOCK) await getSocket(); // bei Mock kein WS-Auth-Token vorhanden
      } else if (MOCK) {
        // Auto-Login als Driver
        const user = makeMockUser("driver@example.com");
        setSession({ user, tokens: { accessToken: "mock" } });
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    if (MOCK) {
      const user = makeMockUser(email || "driver@example.com");
      await SecureStore.setItemAsync("accessToken", "mock");
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      setSession({ user, tokens: { accessToken: "mock" } });
      return; // kein Socket-Connect ohne echtes Token
    }
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, user } = res.data as {
      accessToken: string;
      user: User;
    };
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setSession({ user, tokens: { accessToken } });
    await getSocket();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("user");
    setSession(null);
    closeSocket();
  };

  const value = useMemo(() => ({ session, login, logout }), [session]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
