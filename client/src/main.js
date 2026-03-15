import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "vuetify/styles";
import "./index.css";
import router from "./router/index.js";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "@mdi/font/css/materialdesignicons.css";
import vuetify from "./plugins/vuetify";
import { OhVueIcon } from "oh-vue-icons";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);
app.use(router);
app.use(Toast, { timeout: 3000 });
app.component("v-oh-icon", OhVueIcon);
app.mount("#app");
