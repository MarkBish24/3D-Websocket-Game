import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import { resolveTurn, GameState } from "../game/index.js";

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
      message: "Game synchronized"
    });

    // Notify the other player in the room (if already connected)
    socket.to(`room:${roomId}`).emit("game:opponent_joined", { user: user });
  });

  socket.on("disconnect", () => {
    console.log(`[Game] ${user.username}:${user.id} disconnected from /game`);
  });
  //--------------------------------------------------------------------
  // __________Some of the Actiona a player can do in the game
  //--------------------------------------------------------------------

  // game: turn
  // called when a player makes a move

  // In-memory store for pending turns. In production, move this to Redis.
  // Structure: { [roomId]: { [userId]: turnData } }
  const pendingTurns = {};

  socket.on("game:turn", (data) => {
    const { roomId, turnData } = data;

    if (!roomId) {
      socket.emit("game:error", { message: "No roomId provided" });
      console.log(
        `[Game] ${user.username}:${user.id} tried to submit a move without a roomId`,
      );
      return;
    }

    // Store the turn in memory
    if (!pendingTurns[roomId]) {
      pendingTurns[roomId] = {};
    }

    // record this player's submitted turn
    pendingTurns[roomId][user.id] = turnData;
    console.log(
      `[Game] ${user.username}:${user.id} submitted a turn in room ${roomId}`,
    );

    socket.emit("game:turn_received", {
      userId: user.id,
      message: "Turn received",
    });

    // check how many players are in the room
    const room = io.sockets.adapter.rooms.get(`room:${roomId}`);
    const playerCount = room ? room.size : 0;
    const submittedCount = Object.keys(pendingTurns[roomId]).length;

    // Once all players in the room have submitted, resolve the turn
    if (submittedCount >= playerCount && playerCount > 0) {
      console.log(
        `[Game] All ${playerCount} players have submitted turns for room ${roomId}. Resolving turns...`,
      );

      const resolvedTurn = resolveTurn(pendingTurns[roomId]);

      // emit the resolved turn to all players in the room
      gameNamespace.to(`room:${roomId}`).emit("game:turn_processed", {
        roomId,
        resolvedTurn,
        submittedTurns: pendingTurns[roomId],
      });

      // clear pending turns for this room
      delete pendingTurns[roomId];
    }
  });
});

export const activeGames = new Map();

export function getOrCreateGame(roomId) {
  if (!activeGames.has(roomId)) {
    activeGames.set(roomId, new GameState(roomId));
  }
  return activeGames.get(roomId);
}
