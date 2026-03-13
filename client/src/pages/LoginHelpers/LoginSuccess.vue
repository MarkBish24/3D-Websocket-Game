<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <h2 class="mt-4">Completing Login...</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  const token = route.query.token;
  if (token) {
    localStorage.setItem("token", token);
    // Redirect to home or dashboard after setting the token
    router.push("/");
  } else {
    // If no token, send back to login
    router.push("/login");
  }
});
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
