import { createRouter, createWebHistory } from "vue-router";
import {
  Login,
  Signup,
  Dashboard,
  Play,
  Profile,
  Friends,
  Settings,
  DesignTest,
} from "../pages/index.js";

const routes = [
  { path: "/", name: "Home", component: Dashboard },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  { path: "/play", name: "Play", component: Play },
  { path: "/profile", name: "Profile", component: Profile },
  { path: "/friends", name: "Friends", component: Friends },
  { path: "/settings", name: "Settings", component: Settings },
  { path: "/design-test", name: "DesignTest", component: DesignTest },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
