import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import {
  addSocketToUser,
  removeSocketFromUser,
  getSocketsForUser,
} from "./socketStore.js";
import { getFriends } from "../services/friends.js";
import { getPlayerById } from "../services/players.js";

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
  const player = await getPlayerById(user.id);

  // Check which friends are currently online and get their public status
  const onlineFriends = [];
  for (const friend of friends) {
    if (getSocketsForUser(friend.id).size > 0) {
      const friendPlayer = await getPlayerById(friend.id);
      onlineFriends.push({
        id: friend.id,
        public: friendPlayer.public,
      });
    }
  }

  // Send the list of online friends to the user
  socket.emit("friends:online", onlineFriends);

  // If this is the first socket for this user, emit online event
  if (getSocketsForUser(user.id).size === 1) {
    for (const friend of onlineFriends) {
      socialNamespace.to(`user:${friend.id}`).emit("friend:online", {
        id: user.id,
        public: player.public,
      });
    }
    console.log(`[Social] ${user.username}:${user.id} is now online`);
  }

  socket.on("disconnect", () => {
    // Remove this socket from the user's socket set
    removeSocketFromUser(user.id, socket.id);
    // If this is the last socket for this user, emit offline event
    if (getSocketsForUser(user.id).size === 0) {
      for (const friend of onlineFriends) {
        socialNamespace.to(`user:${friend.id}`).emit("friend:offline", user.id);
      }
      console.log(`[Social] ${user.username}:${user.id} is now offline`);
    }
  });
});
