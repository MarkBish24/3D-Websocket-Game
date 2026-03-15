<template>
  <v-card-title class="font-weight-bold">Who's Online?</v-card-title>
  <v-card-text>
    <v-list>
      <v-list-item v-for="friend in onlineFriends" :key="friend.id">
        <v-list-item-avatar>
          <v-img :src="friend.picture"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ friend.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card-text>
</template>

<script setup></script>

<style scoped></style>
