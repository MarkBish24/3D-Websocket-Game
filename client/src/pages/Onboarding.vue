<template>
  <v-container
    class="fill-height d-flex justify-center align-center onboarding-bg"
  >
    <v-card
      class="glass-card pa-8 text-center"
      max-width="500"
      width="100%"
      elevation="24"
    >
      <!-- Avatar Section -->
      <v-avatar size="100" class="mb-6 avatar-glow" color="surface">
        <v-img
          :src="authStore.user?.picture || defaultAvatar"
          @error="(e) => (e.target.src = defaultAvatar)"
        ></v-img>
      </v-avatar>

      <!-- Welcome Text -->
      <h2 class="text-h4 font-weight-black mb-2 text-primary">Welcome!</h2>
      <p class="text-body-1 text-grey-lighten-1 mb-8">
        You're almost ready to play. Choose a unique username to represent
        yourself in the game.
      </p>

      <!-- Form Section -->
      <v-form @submit.prevent="submitUsername">
        <v-text-field
          v-model="username"
          label="Choose Username"
          variant="solo-filled"
          color="primary"
          rounded="lg"
          :error-messages="errorMessage"
          @input="errorMessage = ''"
          prepend-inner-icon="mdi-account-circle"
          class="custom-input mb-2"
          hint="Must be at least 6 characters"
          persistent-hint
        ></v-text-field>

        <v-btn
          type="submit"
          color="primary"
          size="x-large"
          rounded="xl"
          class="mt-6 w-100 glow-btn font-weight-bold text-h6"
          :loading="loading"
          :disabled="!isValidElement"
          prepend-icon="mdi-rocket-launch"
        >
          Enter Game
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/authStore.js";
import { useRouter } from "vue-router";
import { connectSocialSocket } from "../plugins/userSocket.js";
import defaultAvatar from "../assets/Blank-Avatar-Icon.webp";

const authStore = useAuthStore();
const router = useRouter();
const username = ref("");
const loading = ref(false);
const errorMessage = ref("");

// Require at least 6 characters
const isValidElement = computed(() => {
  return username.value.trim().length >= 6;
});

const submitUsername = async () => {
  if (!isValidElement.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/api/players/${authStore.user.id}/setup`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ username: username.value }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      if (response.status === 400) {
        throw new Error("Username is already taken. Try another one!");
      } else {
        throw new Error("Failed to complete setup. Please try again.");
      }
    }

    // Success! Update local store to use the new name
    authStore.user.name = username.value;

    // Connect socket now that setup is complete
    connectSocialSocket(authStore.token);

    // Send them to the dashboard
    router.push("/");
  } catch (error) {
    console.error("Error completing setup:", error);
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.onboarding-bg {
  position: relative;
  z-index: 1;
}

/* Glassmorphism Card Style */
.glass-card {
  background: rgba(var(--v-theme-surface), 0.75) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  border-radius: 24px !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Hover effect on the card */
.glass-card:hover {
  box-shadow: 0 10px 40px rgba(var(--v-theme-primary), 0.15) !important;
}

/* Neon Glow for Avatar */
.avatar-glow {
  border: 3px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.4);
}

/* Custom Input Field */
.custom-input :deep(.v-field) {
  background: rgba(var(--v-theme-primary), 0.05) !important;
  border: 1px solid transparent;
  transition: border-color 0.3s ease;
}
.custom-input :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.1);
}

/* Glowing primary button */
.glow-btn {
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.4) !important;
  letter-spacing: 1px;
  transition: all 0.3s ease !important;
}

.glow-btn:hover:not(:disabled) {
  box-shadow: 0 0 25px rgba(var(--v-theme-primary), 0.6) !important;
  transform: translateY(-2px);
}
</style>
