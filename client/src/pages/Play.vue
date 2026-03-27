<template>
  <NavBar />
  <v-container>
    <v-row>
      <v-col cols="12">
        <GameCanvas />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import GameCanvas from "../components/game/gameCanvas.vue";
</script>

<style scoped></style>
