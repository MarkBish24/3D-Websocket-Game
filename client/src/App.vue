<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <ToastNotification />
  </v-app>
</template>

<script setup>
import { onMounted } from "vue";
import { connectSocialSocket } from "./plugins/userSocket.js";
import { useAuthStore } from "./stores/authStore.js";
import ToastNotification from "./components/ToastNotification.vue";

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) {
    connectSocialSocket(authStore.token);
  }
});
</script>

<style>
/* Global styles */
</style>
