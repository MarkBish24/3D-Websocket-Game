import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import {
  Login,
  Signup,
  Dashboard,
  Play,
  Profile,
  Friends,
  Settings,
} from "../pages/index.js";

const routes = [
  { path: "/", name: "Home", component: HelloWorld },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/play", name: "Play", component: Play },
  { path: "/profile", name: "Profile", component: Profile },
  { path: "/friends", name: "Friends", component: Friends },
  { path: "/settings", name: "Settings", component: Settings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
