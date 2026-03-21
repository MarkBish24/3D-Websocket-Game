import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import {
  addSocketToUser,
  removeSocketFromUser,
  getSocketsForUser,
} from "./socketStore.js";
import { getFriends } from "../services/friends.js";

// ─── Socket.io Social Events ────────────────────────────────────────────────────

const socialNamespace = io.of("/social");

socialNamespace.use(authenticateSocket);

socialNamespace.on("connect", async (socket) => {
  if (!socket.user) {
    console.log("User not authenticated");
    socket.disconnect();
    return;
  }

  const user = socket.user;

  // Join the user's personal room
  socket.join(`user:${user.id}`);

  // Track this socket by adding it to the user's socket set
  addSocketToUser(user.id, socket.id);

  // Get the user's friends
  const friends = await getFriends(user.id);

  // Check Which friends are currently online
  const onlineFriendsIds = friends
    .filter((friend) => getSocketsForUser(friend.id).size > 0)
    .map((friend) => friend.id);

  // Send the list of online friends to the user
  socket.emit("friends:online", onlineFriendsIds);

  // If this is the first socket for this user, emit online event
  if (getSocketsForUser(user.id).size === 1) {
    for (const friendId of onlineFriendsIds) {
      socialNamespace.to(`user:${friendId}`).emit("friend:online", user.id);
    }
    console.log(`User ${user.id}:${user.username} is now online`);
  }

  socket.on("disconnect", () => {
    // Remove this socket from the user's socket set
    removeSocketFromUser(user.id, socket.id);
    // If this is the last socket for this user, emit offline event
    if (getSocketsForUser(user.id).size === 0) {
      for (const friendId of onlineFriendsIds) {
        socialNamespace.to(`user:${friendId}`).emit("friend:offline", user.id);
      }
      console.log(`User ${user.id}:${user.username} is now offline`);
    }
  });
});
