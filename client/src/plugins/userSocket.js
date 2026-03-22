import { io } from "socket.io-client";
import { useFriendsStore } from "../stores/friendsStore.js";

let socialSocket = null;

export function connectSocialSocket(token) {
  if (socialSocket) return;

  const apiUrl = import.meta.env.VITE_API_URL || "";
  socialSocket = io(`${apiUrl}/social`, {
    auth: {
      token: token,
    },
  });

  socialSocket.on("connect", () => {
    console.log("Connected to social namespace: ", socialSocket.id);
    useFriendsStore().initSocketListeners();
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
