import { io } from "socket.io-client";
import { useLobbyStore } from "../stores/lobbyStore.js";

let lobbySocket = null;

export function connectLobbySocket(token) {
  if (lobbySocket) return;

  const apiUrl = import.meta.env.VITE_API_URL || "";
  lobbySocket = io(`${apiUrl}/lobby`, {
    auth: {
      token: token,
    },
  });

  lobbySocket.on("connect", () => {
    console.log("Connected to lobby namespace: ", lobbySocket.id);
    useLobbyStore().initSocketListeners();
  });

  lobbySocket.on("connect_error", (err) => {
    console.log("Connection error: ", err.message);
  });
}

export function disconnectLobbySocket() {
  if (lobbySocket) {
    lobbySocket.disconnect();
    lobbySocket = null;
  }
}

export function getLobbySocket() {
  return lobbySocket;
}
