import { io } from "socket.io-client";
import { useChatStore } from "../stores/chatStore.js";

let chatSocket = null;

export function connectChatSocket(token) {
  if (chatSocket) return;

  const apiUrl = import.meta.env.VITE_API_URL || "";
  chatSocket = io(`${apiUrl}/chat`, {
    auth: {
      token: token,
    },
  });

  chatSocket.on("connect", () => {
    console.log("Connected to chat namespace: ", chatSocket.id);
    useChatStore().initSocketListeners();
  });

  chatSocket.on("connect_error", (err) => {
    console.log("Connection error: ", err.message);
  });
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}

export function getChatSocket() {
  return chatSocket;
}
