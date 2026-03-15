<template>
  <NavBar />
  <v-container class="mt-16 px-6">
    <v-row>
      <v-col cols="12">
        <SearchPlayers v-model="search" v-model:searchPlayers="searchPlayers" />
        <v-card>
          <v-card-title>Friends</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="friend in friends" :key="friend.id">
                <v-list-item-title>{{ friend.username }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
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
