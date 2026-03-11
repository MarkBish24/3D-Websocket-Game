import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";
import router from "./router/index.js";
import vuetify from "./plugins/vuetify.js";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(Toast, { timeout: 3000 });
app.mount("#app");
