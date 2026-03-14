<template>
  <NavBar />
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Dashboard</h1>
      </v-col>
      <v-col cols="12">
        <template v-if="authStore.isLoggedIn">
          <UserProfile />
        </template>
        <template v-else>
          <v-btn color="primary" to="/login">Login</v-btn>
          <v-btn color="primary" to="/signup">Sign Up</v-btn>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import UserProfile from "../components/UserProfile.vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
</script>

<style scoped></style>
