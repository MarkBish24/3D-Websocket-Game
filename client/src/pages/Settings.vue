<template>
  <NavBar />
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <h1>Settings</h1>
        <v-btn @click="toggleTheme">Toggle Theme</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import { useTheme } from "vuetify";

const vuetifyTheme = useTheme();

function toggleTheme() {
  vuetifyTheme.global.name.value =
    vuetifyTheme.global.name.value === "testTheme"
      ? "testDarkTheme"
      : "testTheme";
}
</script>

<style scoped></style>
