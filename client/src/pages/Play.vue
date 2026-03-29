<template>
  <NavBar />
  <v-container>
    <!-- Show Matchmaking Lobby UI if NO match is active -->
    <v-row
      v-if="
        !lobbyStore.currentRoom || lobbyStore.currentRoom.state === 'waiting'
      "
    >
      <v-col cols="12" sm="8" md="6" class="mx-auto">
        <GameLobby />
      </v-col>
    </v-row>

    <!-- Show the Actual Game Board if a Match has started! -->
    <v-row v-else>
      <v-col cols="12">
        <GamePlayerHeader />
        <GameCanvas />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import GameCanvas from "../components/game/gameCanvas.vue";
import GameLobby from "../components/game/gameLobby.vue";
import GamePlayerHeader from "../components/game/gamePlayerHeader.vue";
import { useLobbyStore } from "../stores/lobbyStore.js";

const lobbyStore = useLobbyStore();
</script>

<style scoped></style>
