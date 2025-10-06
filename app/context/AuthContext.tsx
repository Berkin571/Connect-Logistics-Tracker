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

type AuthCtx = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

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
        await getSocket();
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
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
