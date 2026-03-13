<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Login</h1>
        <v-btn @click="loginWithGoogle">Login with Google</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const loginWithGoogle = () => {
  window.location.href = "http://localhost:3000/api/auth/google";
};
</script>

<style scoped></style>
