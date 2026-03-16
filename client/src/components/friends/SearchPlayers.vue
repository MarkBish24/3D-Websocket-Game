<template>
  <v-row justify="center">
    <v-col cols="12" md="12" lg="12">
      <div class="search-wrapper">
        <v-card class="search-card mt-5" elevation="4">
          <v-card-text class="pa-4">
            <v-text-field
              v-model="search"
              placeholder="Search players by name or email..."
              variant="solo-filled"
              rounded="xl"
              flat
              hide-details
              color="primary"
              class="search-input"
              @input="handleSearch"
              :loading="loading"
            >
              <template v-slot:prepend-inner>
                <v-oh-icon
                  name="md-search"
                  class="search-icon pulse-on-hover"
                  fill="currentColor"
                  scale="1.2"
                ></v-oh-icon>
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>

        <!-- Floating Search Results -->
        <transition name="fade">
          <v-card
            v-if="search.length > 0 && (searchPlayers.length > 0 || !loading)"
            class="results-dropdown mt-2"
            elevation="8"
          >
            <v-list v-if="searchPlayers.length > 0" class="pa-0">
              <v-list-item
                v-for="player in searchPlayers"
                :key="player.id"
                class="px-4 py-2 border-bottom"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40">
                    <v-img
                      :src="player.picture || defaultAvatar"
                      @error="(e) => (e.target.src = defaultAvatar)"
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold">{{
                  player.username
                }}</v-list-item-title>

                <template v-slot:append>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    rounded="xl"
                    size="small"
                    @click="sendFriendRequest(player.id)"
                    prepend-icon="mdi-plus"
                  >
                    Add Friend
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <v-card-text
              v-else-if="!loading"
              class="text-center py-6 text-grey"
            >
              No players found for "{{ search }}"
            </v-card-text>
          </v-card>
        </transition>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import defaultAvatar from "../../assets/Blank-Avatar-Icon.webp";

const search = ref("");
const loading = ref(false);
let searchTimeout = null;

const props = defineProps({
  searchPlayers: Array,
});

const emit = defineEmits(["update:searchPlayers"]);

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (search.value.trim() === "") {
    emit("update:searchPlayers", []);
    return;
  }

  loading.value = true;
  searchTimeout = setTimeout(fetchSearchResults, 500);
};

const fetchSearchResults = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friends/search?query=${encodeURIComponent(search.value)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();
    emit("update:searchPlayers", data);
  } catch (error) {
    console.error("Error searching for friends:", error);
  } finally {
    loading.value = false;
  }
};

const sendFriendRequest = async (addresseeId) => {
  try {
    const response = await fetch("http://localhost:3000/api/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ addresseeId }),
    });

    if (response.ok) {
      // Notify parent to remove from results
      const updatedList = props.searchPlayers.filter(
        (p) => p.id !== addresseeId,
      );
      emit("update:searchPlayers", updatedList);
      alert("Friend request sent!");
    }
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
};
</script>

<style scoped>
.search-wrapper {
  position: relative;
  z-index: 100;
}

.search-card {
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(var(--v-theme-surface), 0.95) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 101;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.search-input :deep(.v-field) {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

.search-icon {
  color: rgb(var(--v-theme-primary));
  margin-right: 8px;
}

.pulse-on-hover:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
