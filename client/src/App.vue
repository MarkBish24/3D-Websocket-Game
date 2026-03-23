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
import { onMounted } from "vue";
import { connectSocialSocket } from "./plugins/userSocket.js";
import { connectChatSocket } from "./plugins/chatSocket.js";
import { useAuthStore } from "./stores/authStore.js";
import ToastNotification from "./components/ToastNotification.vue";
import ChatWindow from "./components/chatWindow.vue";

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) {
    connectSocialSocket(authStore.token);
    connectChatSocket(authStore.token);
  }
});
</script>

<style>
/* Global styles */
</style>
