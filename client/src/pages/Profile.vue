<template>
  <NavBar />
  <v-container class="mt-5">
    <v-row v-if="loading" justify="center" align="center" style="height: 300px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <v-row v-else-if="player">
      <v-col cols="12">
        <v-row align="center" no-gutters>
          <div class="avatar-wrapper" :class="{ clickable: isOwnProfile }">
            <v-badge
              :color="friendsStore.getFriendBadgeColor(player.id)"
              dot
              location="bottom end"
              :offset-x="24"
              :offset-y="24"
            >
              <v-avatar size="100" class="mr-3 avatar-main thick-border">
                <v-img
                  :src="player.picture || defaultAvatar"
                  referrerpolicy="no-referrer"
                  @error="(e) => (e.target.src = defaultAvatar)"
                ></v-img>
              </v-avatar>
            </v-badge>
            <div
              v-if="isOwnProfile"
              class="avatar-overlay d-flex align-center justify-center"
            >
              <v-icon icon="mdi-camera" color="white" size="32"></v-icon>
            </div>
          </div>
          <h1 class="text-h4" v-if="isOwnProfile">{{ player.username }}</h1>
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
import { useFriendsStore } from "../stores/friendsStore";
import defaultAvatar from "../assets/Blank-Avatar-Icon.webp";

const authStore = useAuthStore();
const route = useRoute();
const friendsStore = useFriendsStore();
const player = ref(null);
const loading = ref(true);

const isOwnProfile = computed(() => {
  return (
    authStore.user && player.value && authStore.user.id === player.value.id
  );
});

const fetchPlayer = async (username) => {
  if (!username) return;
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/players/username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      // Session expired or invalid
      authStore.logout();
      window.location.href = "/login"; // Or use router.push('/login')
      return;
    }

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
  fetchPlayer(route.params.username);
});

// Watch for route changes to re-fetch if we navigate to another profile
watch(
  () => route.params.username,
  (newUsername) => {
    fetchPlayer(newUsername);
  },
);
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.avatar-wrapper.clickable:hover {
  cursor: pointer;
  transform: scale(1.05);
}

.avatar-main {
  position: relative;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper.clickable:hover .avatar-overlay {
  opacity: 1;
}

:deep(.v-badge__badge) {
  width: 24px;
  height: 24px;
  border: 2px solid rgb(var(--v-theme-surface)) !important;
}

.thick-border {
  border: 3px solid rgb(var(--v-theme-surface)) !important;
}
</style>
