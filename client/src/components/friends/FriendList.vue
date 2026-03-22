<template>
  <v-card v-if="friends.length > 0" class="rounded-md">
    <v-card-title class="text-h6 font-weight-bold py-3 px-6"
      >Friends</v-card-title
    >
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <v-list>
        <v-list-item
          v-for="friend in friends"
          :key="friend.id"
          class="px-4 border-bottom"
        >
          <template v-slot:prepend>
            <v-badge
              :color="friendsStore.getFriendBadgeColor(friend.id)"
              dot
              location="bottom end"
            >
              <v-avatar color="primary" size="40" class="thick-border">
                <v-img :src="friend.picture || defaultAvatar"></v-img>
              </v-avatar>
            </v-badge>
          </template>

          <v-list-item-title class="font-weight-bold">{{
            friend.username
          }}</v-list-item-title>

          <template v-slot:append>
            <v-btn icon="mdi-play" variant="text" class="settings-btn"></v-btn>
            <v-btn icon="mdi-cogs" variant="text" class="settings-btn"></v-btn>
            <v-btn
              icon="mdi-message"
              variant="text"
              class="settings-btn"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <v-card
    v-else
    class="empty-friends-card glass-card pa-8 text-center"
    elevation="0"
  >
    <div class="empty-state-content">
      <v-icon
        icon="mdi-account-search-outline"
        size="80"
        color="primary"
        class="mb-6 op-50 pulse-animation"
      ></v-icon>
      <div class="text-h5 font-weight-bold mb-2">No Friends Yet</div>
      <p class="text-body-1 text-grey-lighten-1 mb-8">
        Your list is looking a bit lonely. Let's find some friends!
      </p>
      <v-btn
        color="primary"
        variant="elevated"
        rounded="xl"
        size="large"
        prepend-icon="mdi-gamepad-variant"
        @click="router.push('/play')"
        class="px-8 glow-btn"
      >
        Play Now
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import defaultAvatar from "../../assets/Blank-Avatar-Icon.webp";
import { useFriendsStore } from "../../stores/friendsStore.js";

const friends = ref([]);
const friendsStore = useFriendsStore();
const router = useRouter();

const getFriends = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/friends/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    friends.value = data;
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
};

getFriends();
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.border-bottom:last-child {
  border-bottom: none;
}

.settings-btn {
  transition: color 0.2s ease;
}

.settings-btn:hover {
  color: rgb(var(--v-theme-primary));
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.6) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
  border-radius: 20px !important;
}

.pulse-animation {
  animation: pulse 3s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

.glow-btn {
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.3) !important;
  transition: all 0.3s ease !important;
}

.glow-btn:hover {
  box-shadow: 0 0 25px rgba(var(--v-theme-primary), 0.5) !important;
  transform: translateY(-2px);
}

.op-50 {
  opacity: 0.5;
}

.thick-border {
  border: 2px solid rgb(var(--v-theme-surface)) !important;
}
</style>
