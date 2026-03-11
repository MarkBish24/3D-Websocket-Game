<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Theme Test Page</h1>
        <p class="mb-8">Testing: <code>myCustomLightTheme</code></p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Buttons Showcase -->
      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="2">
          <v-card-title>Buttons</v-card-title>
          <v-card-text class="d-flex flex-wrap gap-4">
            <v-btn color="primary">Primary</v-btn>
            <v-btn color="secondary">Secondary</v-btn>
            <v-btn color="success">Success</v-btn>
            <v-btn color="error">Error</v-btn>
            <v-btn color="warning">Warning</v-btn>
            <v-btn color="info">Info</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Colored Cards Showcase -->
      <v-col cols="12" md="6">
        <v-card color="primary" variant="elevated">
          <v-card-title>Primary Card</v-card-title>
          <v-card-text
            >This card uses the <strong>Primary</strong> color from your active
            theme.</v-card-text
          >
        </v-card>

        <v-card color="secondary" variant="elevated" class="mt-4">
          <v-card-title>Secondary Card</v-card-title>
          <v-card-text
            >This card uses the <strong>Secondary</strong> color from your
            active theme.</v-card-text
          >
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-alert
          type="success"
          title="Theme Loaded"
          text="If you see a green alert here and blue/teal buttons above, your custom theme is working perfectly."
          variant="tonal"
        ></v-alert>
      </v-col>
    </v-row>

    <v-app-bar flat border>
      <v-app-bar-title>3D WebSocket Game</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        :icon="
          theme === 'customLightTheme'
            ? 'mdi-weather-night'
            : 'mdi-weather-sunny'
        "
        @click="toggleTheme"
        color="primary"
        >Button</v-btn
      >
    </v-app-bar>
  </v-container>
</template>

<script setup>
import { useTheme } from "vuetify";

const vuetifyTheme = useTheme();

function toggleTheme() {
  vuetifyTheme.global.name.value =
    vuetifyTheme.global.name.value === "testTheme"
      ? "testDarkTheme"
      : "testTheme";
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
