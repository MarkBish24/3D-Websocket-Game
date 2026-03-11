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

export default createVuetify({
  theme: {
    defaultTheme: "customDarkTheme",
    themes: {
      customLightTheme,
      customDarkTheme,
    },
  },
});
