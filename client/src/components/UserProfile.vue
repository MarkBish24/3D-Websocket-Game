<template>
  <div class="d-flex justify-center">
    <v-badge
      v-if="authStore.user && authStore.user.picture"
      :color="isOnline ? 'success' : 'grey'"
      dot
      location="bottom right"
      offset-x="11"
      offset-y="11"
      class="status-badge"
    >
      <v-avatar size="80" class="thick-border">
        <v-img :src="authStore.user.picture" alt="Profile" cover></v-img>
      </v-avatar>
    </v-badge>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const isOnline = ref(true); // Temporary logic for the bubble
</script>

<style scoped>
.status-badge :deep(.v-badge__badge) {
  border: 2px solid rgb(var(--v-theme-surface)) !important;
  width: 17px !important;
  height: 17px !important;
}

.thick-border {
  border: 3px solid rgb(var(--v-theme-surface)) !important;
  transition: border-color 0.3s ease;
}
</style>
