import { createRouter, createWebHistory } from "vue-router";
import {
  Login,
  LoginSuccess,
  Signup,
  Dashboard,
  Play,
  Profile,
  Friends,
  Settings,
  DesignTest,
  Onboarding,
  MapDebugger,
} from "../pages/index.js";

const routes = [
  { path: "/", name: "Home", component: Dashboard },
  { path: "/login", name: "Login", component: Login },
  { path: "/login-success", name: "LoginSuccess", component: LoginSuccess },
  { path: "/signup", name: "Signup", component: Signup },
  { path: "/play", name: "Play", component: Play },
  { path: "/profile/:username", name: "Profile", component: Profile },
  { path: "/friends", name: "Friends", component: Friends },
  { path: "/settings", name: "Settings", component: Settings },
  { path: "/design-test", name: "DesignTest", component: DesignTest },
  { path: "/onboarding", name: "Onboarding", component: Onboarding },
  { path: "/map-debugger", name: "MapDebugger", component: MapDebugger },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
