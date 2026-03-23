<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <h2 class="mt-4">Completing Login...</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { connectSocialSocket } from "../../plugins/userSocket.js";
import { connectChatSocket } from "../../plugins/chatSocket.js";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  const token = route.query.token;
  if (token) {
    try {
      // Decode JWT payload (middle part of the token)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const userData = JSON.parse(jsonPayload);

      // Map DB fields to what components expect
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.username,
        picture: userData.picture,
      };

      authStore.setAuth(user, token);
      if (!userData.setup_complete) {
        router.push("/onboarding");
      } else {
        connectSocialSocket(token);
        connectChatSocket(token);
        router.push("/");
      }
    } catch (e) {
      console.error("Token decoding failed", e);
      router.push("/login");
    }
  } else {
    router.push("/login");
  }
});
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
