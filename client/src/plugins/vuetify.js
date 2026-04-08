import { createVuetify } from "vuetify";

const customLightTheme = {
  dark: false,
  colors: {
    background: "#F1F1F1",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5",
    primary: "#1867C0",
    secondary: "#48A9A6",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    // ── Game Canvas Colors ───────────────────────
    gameBackground: "#E8E8E8",
    gameHexNormal: "#D8D8D8",
    gameHexStroke: "#B8B8B8",
    gameHexObstacle: "#A0A0A0",
    gameHexRing: "#C0C0C0",
    gameUnitShadow: "#000000",
    gameCheckpoint: "#FF6F00",
    gameSelection: "#0066FF",
    gamePlayerRed: "#B00020", // matches error
    gamePlayerGreen: "#2E7D32",
  },
};

const customDarkTheme = {
  dark: true,
  colors: {
    background: "#1E1E1E",
    surface: "#2F2F2F",
    surfaceVariant: "#4A4A4A",
    primary: "#2196F3",
    secondary: "#03DAC6",
    error: "#CF6679",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    // ── Game Canvas Colors ───────────────────────
    gameBackground: "#000000",
    gameHexNormal: "#383838", // Lighter normal hex
    gameHexStroke: "#555555", // Lighter stroke
    gameHexObstacle: "#1c1c1c", // Lighter obstacle
    gameHexRing: "#3A3A3A",
    gameUnitShadow: "#FFFFFF",
    gameCheckpoint: "#FFD700",
    gameSelection: "#00FFFF",
    gamePlayerRed: "#FF5252", // Vivid red for dark mode
    gamePlayerGreen: "#00E676",
  },
};

const testTheme = {
  dark: false,
  colors: {
    background: "#f7f7E6",
    surface: "#f2e6c9",
    surfaceVariant: "#FDF9F1",
    primary: "#3a5f8a",
    secondary: "#c59a3d",
    error: "#8e2c2c",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    // ── Game Canvas Colors ───────────────────────
    gameBackground: "#f0ead8",
    gameHexNormal: "#e4dcc8",
    gameHexStroke: "#c8bfa8",
    gameHexObstacle: "#b0a898",
    gameHexRing: "#cec6b0",
    gameUnitShadow: "#000000",
    gameCheckpoint: "#FF6F00",
    gameSelection: "#0066FF",
    gamePlayerRed: "#8e2c2c", // matches error
    gamePlayerGreen: "#388E3C",
  },
};

const testDarkTheme = {
  dark: true,
  colors: {
    background: "#0c111d",
    surface: "#182230",
    surfaceVariant: "#3D546F",
    primary: "#5c86b8",
    secondary: "#e0b455",
    error: "#b33c3c",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    // ── Game Canvas Colors ───────────────────────
    gameBackground: "#000000",
    gameHexNormal: "#2c3e50", // Lighter normal hex
    gameHexStroke: "#4f6d91", // Lighter stroke
    gameHexObstacle: "#1c2738", // Lighter obstacle
    gameHexRing: "#2a3a50",
    gameUnitShadow: "#FFFFFF",
    gameCheckpoint: "#FFD700",
    gameSelection: "#00FFFF",
    gamePlayerRed: "#FF5252", // Vivid red for dark mode
    gamePlayerGreen: "#00E676",
  },
};

// #8e2c2c	(142,44,44)
// #3a5f8a	(58,95,138)
// #c59a3d	(197,154,61)
// #f2e6c9	(242,230,201)
// #f7f7f5	(247,247,245)

export default createVuetify({
  theme: {
    defaultTheme: "testDarkTheme",
    themes: {
      customLightTheme,
      customDarkTheme,
      testTheme,
      testDarkTheme,
    },
  },
});
