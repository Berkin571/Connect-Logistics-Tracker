import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import { Env } from "../utils/env";

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await SecureStore.getItemAsync("accessToken");
  socket = io(Env.WS_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token },
  });
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
