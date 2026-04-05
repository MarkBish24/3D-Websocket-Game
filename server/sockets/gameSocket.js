import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import { GameState } from "../game/index.js";

const gameNamespace = io.of("/game");

gameNamespace.use(authenticateSocket);

gameNamespace.on("connect", (socket) => {
  if (!socket.user) {
    console.log("User not authenticated");
    socket.disconnect();
    return;
  }

  const user = socket.user;
  console.log(`[Game] ${user.username}:${user.id} connected to /game`);

  // game: join
  // called immediately after lobby:match_found resolves on the client.
  //puts both players in the same room so broadcasts are scoped

  socket.on("game:join", (roomId) => {
    if (!roomId) {
      socket.emit("game:error", "No roomId provided");
      console.log(
        `[Game] ${user.username}:${user.id} tried to join a room without a roomId`,
      );
      return;
    }

    socket.join(`room:${roomId}`);
    console.log(`[Game] ${user.username}:${user.id} joined room ${roomId}`);

    // Fetch the active GameState, add the player
    const matchData = getOrCreateGame(roomId);
    matchData.addPlayer(user);

    // Send the joining client the full game state payload (including the Hex map!)
    socket.emit("game:state_sync", {
      roomId,
      matchData: matchData.serialize(),
      message: "Game synchronized",
    });

    // Notify the other player in the room (if already connected)
    socket.to(`room:${roomId}`).emit("game:opponent_joined", { user: user });
  });

  socket.on("disconnect", () => {
    console.log(`[Game] ${user.username}:${user.id} disconnected from /game`);
  });

  // game: hex_clicked
  // called when a player clicks on a hex
  socket.on("game:hex_clicked", (data) => {
    const { roomId, q, r, s } = data;

    console.log(
      `[Game] ${user.username}:${user.id} clicked on hex ${q}, ${r}, ${s} in room ${roomId}`,
    );
  });
});

export const activeGames = new Map();

export function getOrCreateGame(roomId) {
  if (!activeGames.has(roomId)) {
    activeGames.set(roomId, new GameState(roomId));
  }
  return activeGames.get(roomId);
}
