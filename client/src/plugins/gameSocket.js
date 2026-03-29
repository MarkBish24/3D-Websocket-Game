import { io } from "socket.io-client";
import { useGameStore } from "../stores/gameStore.js";

let gameSocket = null;

export function connectGameSocket(token) {
  if (gameSocket) return;

  const apiUrl = import.meta.env.VITE_API_URL || "";

  gameSocket = io(`${apiUrl}/game`, {
    auth: {
      token: token,
    },
  });

  gameSocket.on("connect", () => {
    console.log("Connected to game server");
    useGameStore().initSocketListeners();
  });

  gameSocket.on("connect_error", (err) => {
    console.log("Connection error: ", err.message);
  });
}

export function disconnectGameSocket() {
  if (gameSocket) {
    gameSocket.disconnect();
    gameSocket = null;
  }
}

export function getGameSocket() {
  return gameSocket;
}
