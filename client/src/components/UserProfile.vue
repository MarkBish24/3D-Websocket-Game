<template>
  <v-avatar
    v-if="authStore.user && authStore.user.picture"
    size="80"
    class="mx-auto mt-5 border"
  >
    <v-img :src="authStore.user.picture" alt="Profile" cover></v-img>
  </v-avatar>
</template>

<script setup>
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
</script>
