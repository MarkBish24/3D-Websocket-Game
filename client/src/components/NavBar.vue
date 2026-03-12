<template>
  <v-navigation-drawer width="220">
    <v-list density="compact" nav>
      <template v-for="(item, index) in items" :key="item.title">
        <v-list-item link @click="navigate(item.link)">
          <v-row no-gutters align="center">
            <v-icon :icon="item.icon" class="mr-3"></v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-row>
        </v-list-item>
        <v-divider
          v-if="index < items.length - 1"
          class="my-1 custom-divider"
        ></v-divider>
      </template>
    </v-list>
  </v-navigation-drawer>
  <v-main> </v-main>
</template>

<script setup>
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { ref } from "vue";
import { useRouter } from "vue-router";

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
  { title: "Logout", icon: "mdi-logout", link: "/logout" },
]);
</script>

<style scoped>
.custom-divider {
  border-color: rgba(var(--v-theme-primary), 0.1) !important;
  opacity: 0.5;
  margin-left: 12px;
  margin-right: 12px;
}

/* Optional: Slight glow or highlight effect on hover */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>

<style scoped></style>
