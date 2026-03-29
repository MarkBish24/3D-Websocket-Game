import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import {
  findOrCreateRoom,
  leaveRoom,
  getRoomById,
} from "../services/lobbyManager.js";

// create the new namespace
const lobbyNamespace = io.of("/lobby");

lobbyNamespace.use(authenticateSocket);

// keep track of users in the lobby
const usersInLobby = new Map();

lobbyNamespace.on("connect", (socket) => {
  if (!socket.user) {
    console.log("User not authenticated");
    socket.disconnect();
    return;
  }

  const user = socket.user;
  console.log(`[Lobby] ${user.username}:${user.id} connected to /lobby`);

  // add user to the map
  usersInLobby.set(user.id, socket);

  // broadcast the updated user list to all users in the lobby
  lobbyNamespace.emit("lobby:users", Array.from(usersInLobby.keys()));

  // handle disconnect
  socket.on("disconnect", () => {
    console.log(`[Lobby] ${user.username}:${user.id} disconnected from /lobby`);
    usersInLobby.delete(user.id);
    lobbyNamespace.emit("lobby:users", Array.from(usersInLobby.keys()));

    // Clean up if they close their browser while waiting in queue or in a match
    const room = leaveRoom(user.id);
    if (room) {
      socket.leave(room.id);
      if (!room.isEmpty()) {
        lobbyNamespace.to(room.id).emit("lobby:match_left", room);
      }
    }
  });

  socket.on("lobby:find_match", async () => {
    console.log(`[Lobby] ${user.username}:${user.id} pressed Find Match!`);
    // IMPORTANT: Ignore the frontend's userId payload!
    // Always use the securely authenticated user object from the middleware.
    const room = findOrCreateRoom(user.id, socket.id);

    // Make sure the socket actually joins the server room!
    socket.join(room.id);
    console.log(
      `[Lobby] ${user.username}:${user.id} joined socket.io room: ${room.id} (Players: ${room.players.length}/${room.maxPlayers})`,
    );

    if (room.isFull()) {
      console.log(
        `[Lobby] SUCCESS! Room ${room.id} is full! Emitting 'match_found' to both players!`,
      );
      lobbyNamespace.to(room.id).emit("lobby:match_found", room);
    } else {
      console.log(
        `[Lobby] Room ${room.id} is waiting for an opponent. Emitting 'match_searching'...`,
      );
      socket.emit("lobby:match_searching", room);
    }
  });

  socket.on("lobby:leave", async () => {
    console.log(
      `[Lobby] ${user.username}:${user.id} pressed Cancel/Leave Match!`,
    );
    // Use the authenticated user context instead of the payload
    const room = leaveRoom(user.id);

    if (room) {
      socket.leave(room.id);
      console.log(
        `[Lobby] ${user.username}:${user.id} left socket.io room: ${room.id}`,
      );
      if (!room.isEmpty()) {
        console.log(
          `[Lobby] Room ${room.id} still has players. Alerting remaining players via 'match_left'...`,
        );
        lobbyNamespace.to(room.id).emit("lobby:match_left", room);
      } else {
        console.log(
          `[Lobby] Room ${room.id} is now empty and has been disbanded.`,
        );
      }
    }
  });

  // later

  socket.on("lobby:startmatch", async (data) => {
    const { userId, socketId } = data;
  });

  socket.on("lobby:invite", async (data) => {
    const { userId, socketId } = data;
  });

  socket.on("lobby:invite:accept", async (data) => {
    const { userId, socketId } = data;
  });

  socket.on("lobby:invite:reject", async (data) => {
    const { userId, socketId } = data;
  });
});
