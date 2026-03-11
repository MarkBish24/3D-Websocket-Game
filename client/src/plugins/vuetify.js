import { createVuetify } from "vuetify";

const customLightTheme = {
  dark: false,
  colors: {
    background: "#F1F1F1",
    surface: "#FFFFFF",
    primary: "#1867C0",
    secondary: "#48A9A6",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};

const customDarkTheme = {
  dark: true,
  colors: {
    background: "#1E1E1E",
    surface: "#2F2F2F",
    primary: "#2196F3",
    secondary: "#03DAC6",
    error: "#CF6679",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};

const testTheme = {
  dark: false,
  colors: {
    background: "#f7f7E6",
    surface: "#f2e6c9",
    primary: "#3a5f8a",
    secondary: "#c59a3d",
    error: "#8e2c2c",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};

const testDarkTheme = {
  dark: true,
  colors: {
    background: "#0c111d",
    surface: "#182230",
    primary: "#5c86b8",
    secondary: "#e0b455",
    error: "#b33c3c",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};

// #8e2c2c	(142,44,44)
// #3a5f8a	(58,95,138)
// #c59a3d	(197,154,61)
// #f2e6c9	(242,230,201)
// #f7f7f5	(247,247,245)

export default createVuetify({
  theme: {
    defaultTheme: "customDarkTheme",
    themes: {
      customLightTheme,
      customDarkTheme,
      testTheme,
      testDarkTheme,
    },
  },
});
