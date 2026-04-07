<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <ToastNotification />
    <ChatWindow />
  </v-app>
</template>

<script setup>
import { watch } from "vue";
import { connectSocialSocket, disconnectSocialSocket } from "./plugins/userSocket.js";
import { connectChatSocket, disconnectChatSocket } from "./plugins/chatSocket.js";
import { connectLobbySocket, disconnectLobbySocket } from "./plugins/lobbySocket.js";
import { connectGameSocket, disconnectGameSocket } from "./plugins/gameSocket.js";
import { useAuthStore } from "./stores/authStore.js";
import ToastNotification from "./components/ToastNotification.vue";
import ChatWindow from "./components/chatWindow.vue";

const authStore = useAuthStore();

watch(() => authStore.token, (newToken) => {
  if (newToken) {
    connectSocialSocket(newToken);
    connectChatSocket(newToken);
    connectLobbySocket(newToken);
    connectGameSocket(newToken);
  } else {
    disconnectSocialSocket();
    disconnectChatSocket();
    disconnectLobbySocket();
    disconnectGameSocket();
  }
}, { immediate: true });
</script>

<style>
/* Global styles */
</style>
