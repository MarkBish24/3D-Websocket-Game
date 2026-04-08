<template>
  <v-row class="mb-4">
    <!-- Player 1 (Creator) - RED -->
    <v-col cols="6">
      <v-card class="text-center pb-2 elevation-3 rounded-lg" color="surface">
        <v-card-title 
          class="font-weight-bold" 
          :style="{ color: gameColors.redUnit }"
        >
          {{ player1 ? player1.username : "Loading..." }}
        </v-card-title>
        <v-avatar 
          size="64" 
          class="mb-2 border-sm" 
          :style="{ borderColor: gameColors.redUnit + ' !important' }"
        >
          <v-img :src="player1?.picture || 'https://cdn.vuetifyjs.com/images/john.jpg'"></v-img>
        </v-avatar>
      </v-card>
    </v-col>

    <!-- Player 2 (Challenger) - GREEN -->
    <v-col cols="6">
      <v-card class="text-center pb-2 elevation-3 rounded-lg" color="surface">
        <v-card-title 
          class="font-weight-bold" 
          :style="{ color: gameColors.greenUnit }"
        >
          {{ player2 ? player2.username : "Loading..." }}
        </v-card-title>
        <v-avatar 
          size="64" 
          class="mb-2 border-sm" 
          :style="{ borderColor: gameColors.greenUnit + ' !important' }"
        >
          <v-img :src="player2?.picture || 'https://cdn.vuetifyjs.com/images/john.jpg'"></v-img>
        </v-avatar>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useLobbyStore } from "../../stores/lobbyStore.js";
import { useGameTheme } from "../../composables/useGameTheme.js";

const lobbyStore = useLobbyStore();
const { gameColors } = useGameTheme();

const player1 = ref(null);
const player2 = ref(null);

const fetchPlayer = async (userId) => {
  if (!userId) return null;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/players/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching player:", error);
    return null;
  }
};

onMounted(async () => {
  const room = lobbyStore.currentRoom;
  if (room && room.players.length >= 2) {
    player1.value = await fetchPlayer(room.players[0].userId);
    player2.value = await fetchPlayer(room.players[1].userId);
  }
});
</script>
