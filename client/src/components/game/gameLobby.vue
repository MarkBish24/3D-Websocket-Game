<template>
  <v-card class="elevation-4 mt-10 rounded-xl bg-grey-darken-4">
    <v-card-title class="text-h4 font-weight-bold text-center py-6 text-primary">
      Game Lobby
    </v-card-title>
    
    <v-card-text class="text-center pb-8">
      <!-- IDLE STATE -->
      <div v-if="!lobbyStore.isSearching && !lobbyStore.currentRoom">
        <v-btn size="x-large" color="primary" class="font-weight-bold" @click="lobbyStore.findMatch">
          <v-icon left class="mr-2">mdi-magnify</v-icon> Find Match
        </v-btn>
      </div>

      <!-- SEARCHING STATE -->
      <div v-else-if="lobbyStore.isSearching">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
        <h3 class="text-h6 mb-6">Searching for Opponent...</h3>
        <v-btn color="error" variant="text" @click="lobbyStore.leaveMatch">
          Cancel Search
        </v-btn>
      </div>

      <!-- MATCH STARTING STATE -->
      <div v-else-if="lobbyStore.currentRoom">
        <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
        <h3 class="text-h5 text-success font-weight-bold">Match Found!</h3>
        <p class="text-grey mb-6">Connecting to game servers...</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useLobbyStore } from "../../stores/lobbyStore.js";
const lobbyStore = useLobbyStore();
</script>
