import { defineStore } from "pinia";
import { getChatSocket } from "../plugins/chatSocket.js";
import axios from "axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [],
    _listenersInitialized: false,
  }),
  actions: {
    initSocketListeners() {
      const socket = getChatSocket();
      if (!socket || this._listenersInitialized) return;
      this._listenersInitialized = true;

      socket.on("chat:message", (data) => {
        this.messages.push(data);
      });
    },

    sendMessage(chatId, message) {
      const socket = getChatSocket();
      if (!socket) return;
      socket.emit("chat:message", { chatId, message });
    },

    joinChat(chatId) {
      const socket = getChatSocket();
      if (!socket) return;
      socket.emit("chat:join", chatId);
    },

    leaveChat(chatId) {
      const socket = getChatSocket();
      if (!socket) return;
      socket.emit("chat:leave", chatId);
    },
    async openChat(friendId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";

        // get the officiaal true room ID from the new controller
        const response = await axios.get(
          `${apiUrl}/api/chat/private/${friendId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust to how you store token
            },
          },
        );
        const chatId = response.data.chatId;

        // clear old messages and join the new chat room
        this.messages = [];

        // join the new chat room
        this.joinChat(chatId);

        // fetch the previos messages from the server
        const historyResponse = await axios.get(
          `${apiUrl}/api/chat/history/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        this.messages = historyResponse.data;
      } catch (error) {
        console.error("Error opening private chat:", error);
        return null;
      }
    },
  },
});
