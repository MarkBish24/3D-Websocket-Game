<template v-if="friendRequests.length > 0">
  <template v-for="request in friendRequests" :key="request.id">
    <v-card class="mb-2 px-4 py-2 rounded-md">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-avatar>
            <v-img
              :src="request.picture || defaultAvatar"
              @error="(e) => (e.target.src = defaultAvatar)"
            ></v-img>
          </v-avatar>
        </v-col>
        <v-col>
          <v-card-title>{{ request.username }}</v-card-title>
        </v-col>
        <v-col cols="auto" class="pr-2">
          <v-card-actions>
            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              class="mr-2"
              @click="acceptFriendRequest(request.id)"
            >
              Accept
            </v-btn>
            <v-btn
              color="error"
              variant="elevated"
              size="small"
              @click="declineFriendRequest(request.id)"
            >
              Decline
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
  </template>
</template>

<script setup>
import { ref } from "vue";
import defaultAvatar from "../../assets/Blank-Avatar-Icon.webp";

const friendRequests = ref([]);

const fetchFriendRequests = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/friends/requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    friendRequests.value = data;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
  }
};

const handleResponse = async (friendshipId, status) => {
  try {
    const response = await fetch("http://localhost:3000/api/friends/respond", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ friendshipId, status }),
    });

    if (response.ok) {
      // Remove the request from the local list
      friendRequests.value = friendRequests.value.filter(
        (r) => r.id !== friendshipId,
      );
    }
  } catch (error) {
    console.error(`Error ${status}ing friend request:`, error);
  }
};

const acceptFriendRequest = (friendshipId) => {
  handleResponse(friendshipId, "accepted");
};

const declineFriendRequest = (friendshipId) => {
  handleResponse(friendshipId, "declined");
};

fetchFriendRequests();
</script>

<style scoped></style>
