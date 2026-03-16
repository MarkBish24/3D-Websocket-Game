<template>
  <NavBar />
  <v-container class="mt-16 px-6">
    <v-row>
      <v-col cols="12">
        <FriendRequestList class="mb-4" />
        <SearchPlayers
          v-model="search"
          v-model:searchPlayers="searchPlayers"
          class="mb-4"
        />
        <FriendList class="mt-4" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import SearchPlayers from "../components/friends/SearchPlayers.vue";
import FriendList from "../components/friends/FriendList.vue";
import FriendRequestList from "../components/friends/FriendRequestList.vue";
import { ref } from "vue";

const searchPlayers = ref([]);
const friends = ref([]);
</script>

<style scoped></style>
