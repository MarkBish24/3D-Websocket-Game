import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import App from "./App.vue";
import "vuetify/styles";
import "./index.css";
import router from "./router/index.js";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

app.use(createPinia());
app.use(createVuetify());
app.use(router);
app.use(Toast, { timeout: 3000 });
app.mount("#app");
