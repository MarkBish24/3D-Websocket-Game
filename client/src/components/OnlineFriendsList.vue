<template>
  <v-card-title class="font-weight-bold">Who's Online?</v-card-title>
  <v-card-text class="pa-0">
    <v-list density="compact">
      <v-list-item v-for="friend in onlineFriends" :key="friend.id">
        <template v-slot:prepend>
          <v-badge color="success" dot location="bottom end">
            <v-avatar color="primary" size="32">
              <v-img :src="friend.picture"></v-img>
            </v-avatar>
          </v-badge>
        </template>
        <v-list-item-title>{{ friend.username }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-for="friend in offlineFriends" :key="friend.id">
        <template v-slot:prepend>
          <v-badge color="grey" dot location="bottom end">
            <v-avatar color="primary" size="32">
              <v-img :src="friend.picture"></v-img>
            </v-avatar>
          </v-badge>
        </template>
        <v-list-item-title class="text-grey">{{ friend.username }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card-text>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFriendsStore } from "../stores/friendsStore.js";

const allFriends = ref([]);
const friendsStore = useFriendsStore();

const onlineFriends = computed(() => {
  return allFriends.value.filter((friend) =>
    friendsStore.isFriendOnline(friend.id),
  );
});

const offlineFriends = computed(() => {
  return allFriends.value.filter(
    (friend) => !friendsStore.isFriendOnline(friend.id),
  );
});

const getFriends = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/friends/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    allFriends.value = await response.json();
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
};

onMounted(() => {
  getFriends();
});
</script>

<style scoped></style>
