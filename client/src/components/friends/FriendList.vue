<template>
  <v-card class="rounded-md">
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
            <v-avatar color="primary" size="40">
              <v-img
                :src="friend.picture || defaultAvatar"
                @error="(e) => (e.target.src = defaultAvatar)"
              ></v-img>
            </v-avatar>
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
</template>

<script setup>
import { ref } from "vue";
import defaultAvatar from "../../assets/Blank-Avatar-Icon.webp";

const friends = ref([]);

const getFriends = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/friends/list", {
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

.settings-btn:hover {
  color: rgb(var(--v-theme-success));
}

.settings-btn:hover {
  color: rgb(var(--v-theme-primary));
}

.settings-btn:hover {
  color: rgb(var(--v-theme-info));
}
</style>
