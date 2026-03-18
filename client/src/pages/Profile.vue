<template>
  <NavBar />
  <v-container class="mt-5">
    <v-row v-if="loading" justify="center" align="center" style="height: 300px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <v-row v-else-if="player">
      <v-col cols="12">
        <v-row align="center" no-gutters>
          <v-avatar size="100" class="mr-3">
            <v-img :src="player.picture || '/Blank-Avatar-Icon.webp'"></v-img>
          </v-avatar>
          <h1 class="text-h4" v-if="isOwnProfile">Your Profile</h1>
          <h1 class="text-h4" v-else>{{ player.username }}'s Profile</h1>
        </v-row>
      </v-col>
    </v-row>

    <v-row v-else justify="center" align="center" style="height: 300px">
      <v-col class="text-center">
        <v-icon icon="mdi-account-off" size="large"></v-icon>
        <p>Player not found</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import { useRoute } from "vue-router";
import { ref, onMounted, watch, computed } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const route = useRoute();
const player = ref(null);
const loading = ref(true);

const isOwnProfile = computed(() => {
  return (
    authStore.user && player.value && authStore.user.id === player.value.id
  );
});

const fetchPlayer = async (id) => {
  if (!id) return;
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/players/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      player.value = data;
      console.log(player.value);
    }
  } catch (error) {
    console.error("Error fetching player:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPlayer(route.params.id);
});

// Watch for route changes to re-fetch if we navigate to another profile
watch(
  () => route.params.id,
  (newId) => {
    fetchPlayer(newId);
  },
);
</script>

<style scoped></style>
