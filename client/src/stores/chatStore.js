import { defineStore } from "pinia";
import { getChatSocket } from "../plugins/chatSocket.js";

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
  },
});
