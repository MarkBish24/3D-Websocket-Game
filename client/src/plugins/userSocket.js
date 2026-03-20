import { useAuthStore } from "../stores/authStore.js";
import { io } from "socket.io-client";

let socialSocket = null;

export function connectSocialSocket(token) {
  if (socialSocket) return;

  socialSocket = io("/social", {
    auth: {
      token: token,
    },
  });

  socialSocket.on("connect", () => {
    console.log("Connected to social namespace: ", socialSocket.id);
  });

  socialSocket.on("connect_error", (err) => {
    console.log("Connection error: ", err.message);
  });
}

export function disconnectSocialSocket() {
  if (socialSocket) {
    socialSocket.disconnect();
    socialSocket = null;
  }
}

export function getSocialSocket() {
  return socialSocket;
}
