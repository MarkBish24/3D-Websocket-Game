import { defineStore } from "pinia";
import { disconnectSocialSocket } from "../plugins/userSocket.js";
import { disconnectChatSocket } from "../plugins/chatSocket.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    logout() {
      disconnectSocialSocket();
      disconnectChatSocket();
      this.user = null;
      this.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});
