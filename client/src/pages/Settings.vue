<template>
  <NavBar />
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <h1>Settings</h1>
        <v-btn @click="toggleTheme">Toggle Theme</v-btn>
        <v-switch
          v-model="publicStatus"
          label="Public"
          color="success"
          @update:model-value="updatePublicStatus"
        ></v-switch>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import { useTheme } from "vuetify";
import { useAuthStore } from "../stores/authStore";

const vuetifyTheme = useTheme();
const authStore = useAuthStore();
const publicStatus = ref(authStore.user.public);

function toggleTheme() {
  vuetifyTheme.global.name.value =
    vuetifyTheme.global.name.value === "testTheme"
      ? "testDarkTheme"
      : "testTheme";
}

const getPublicStatus = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/players/${authStore.user.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      publicStatus.value = data.public;
    }
  } catch (err) {
    console.error("Failed to get public status", err.message);
  }
};

onMounted(() => {
  if (authStore.user) {
    getPublicStatus();
  }
});

const updatePublicStatus = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/players/${authStore.user.id}/public`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ public: publicStatus.value }),
      },
    );

    if (response.ok) {
      authStore.user.public = publicStatus.value;
    }
  } catch (err) {
    console.error("Failed to update public status", err.message);
  }
};
</script>

<style scoped></style>
