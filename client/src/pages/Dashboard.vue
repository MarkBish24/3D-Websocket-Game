<template>
  <NavBar />
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Dashboard</h1>
      </v-col>
      <v-col cols="12">
        <UserProfile />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import UserProfile from "../components/UserProfile.vue";
</script>

<style scoped></style>
