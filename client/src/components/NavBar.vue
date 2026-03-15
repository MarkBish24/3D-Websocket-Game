<template>
  <v-navigation-drawer width="220">
    <v-list density="compact" nav>
      <template v-for="item in items" :key="item.title">
        <v-list-item link @click="navigate(item.link)" class="nav-item">
          <v-row no-gutters align="center">
            <v-icon :icon="item.icon" class="mr-3 nav-icon"></v-icon>
            <v-list-item-title class="nav-title">{{
              item.title
            }}</v-list-item-title>
          </v-row>
        </v-list-item>
      </template>
      <v-list-item link @click="logout" class="mt-auto">
        <v-row no-gutters align="center">
          <v-icon icon="mdi-logout" class="mr-3" color="error"></v-icon>
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-row>
      </v-list-item>
    </v-list>
    <v-divider class="custom-divider"></v-divider>
    <OnlineFriendsList />
  </v-navigation-drawer>
</template>

<script setup>
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import OnlineFriendsList from "./OnlineFriendsList.vue";

const authStore = useAuthStore();
const router = useRouter();

const navigate = (link) => {
  router.push(link);
};

addIcons(
  "mdi-view-dashboard",
  "mdi-gamepad",
  "mdi-account",
  "mdi-account-group",
  "mdi-cog",
  "mdi-logout",
);

const items = ref([
  { title: "Dashboard", icon: "mdi-view-dashboard", link: "/" },
  { title: "Play", icon: "mdi-gamepad", link: "/play" },
  { title: "Profile", icon: "mdi-account", link: "/profile" },
  { title: "Friends", icon: "mdi-account-group", link: "/friends" },
  { title: "Settings", icon: "mdi-cog", link: "/settings" },
]);

const logout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.custom-divider {
  border-color: rgba(var(--v-theme-primary), 0.1) !important;
  opacity: 0.5;
  margin-left: 12px;
  margin-right: 12px;
}

/* Change text and icon color to primary on hover */
.nav-item:hover .nav-icon,
.nav-item:hover .nav-title {
  color: rgb(var(--v-theme-primary)) !important;
  transition: color 0.2s ease;
}

/* Smooth transition for non-hover state too */
.nav-icon,
.nav-title {
  transition: color 0.2s ease;
}
</style>
