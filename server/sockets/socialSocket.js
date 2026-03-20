import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import {
  addSocketToUser,
  removeSocketFromUser,
  getSocketsForUser,
} from "./socketStore.js";

// ─── Socket.io Social Events ────────────────────────────────────────────────────

const socialNamespace = io.of("/social");

socialNamespace.use(authenticateSocket);

socialNamespace.on("connect", (socket) => {
  if (!socket.user) {
    console.log("User not authenticated");
    socket.disconnect();
    return;
  }

  socket.join(`user:${socket.user.id}`);

  addSocketToUser(socket.user.id, socket.id);

  if (getSocketsForUser(socket.user.id).size === 1) {
    socialNamespace.to(`user:${socket.user.id}`).emit("user:online", {
      userId: socket.user.id,
    });
  }

  console.log(
    `User connected to social namespace: ${socket.user.id}:${socket.user.username}`,
  );

  socket.on("disconnect", () => {
    removeSocketFromUser(socket.user.id, socket.id);
    if (getSocketsForUser(socket.user.id).size === 0) {
      socialNamespace.to(`user:${socket.user.id}`).emit("user:offline", {
        userId: socket.user.id,
      });
    }
    console.log(
      `User disconnected from social namespace: ${socket.user.id}:${socket.user.username}`,
    );
  });
});
