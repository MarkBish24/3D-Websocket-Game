<template>
  <v-snackbar
    v-model="friendsStore.toast.show"
    :timeout="10000"
    :color="friendsStore.toast.color"
    location="top right"
    variant="tonal"
    elevation="24"
    rounded="lg"
  >
    <div class="font-weight-bold">{{ friendsStore.toast.title }}</div>
    <div class="text-body-2">{{ friendsStore.toast.message }}</div>

    <!-- Timer progress bar -->
    <div class="timer-bar-wrapper mt-2">
      <div :class="['timer-bar', { active: animating }]"></div>
    </div>

    <template v-slot:actions>
      <v-btn
        icon="mdi-close"
        size="small"
        @click="friendsStore.toast.show = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from "vue";
import { useFriendsStore } from "../stores/friendsStore.js";

const friendsStore = useFriendsStore();
const animating = ref(false);

// Restart the animation every time a new toast is shown
watch(
  () => friendsStore.toast.show,
  (val) => {
    if (val) {
      animating.value = false;
      // Tiny delay so the CSS transition resets before restarting
      setTimeout(() => {
        animating.value = true;
      }, 50);
    }
  },
);
</script>

<style scoped>
.timer-bar-wrapper {
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  width: 100%;
  background: currentColor;
  opacity: 0.6;
  transform-origin: left;
  transform: scaleX(1);
}

.timer-bar.active {
  transition: transform 10s linear;
  transform: scaleX(0);
}
</style>
