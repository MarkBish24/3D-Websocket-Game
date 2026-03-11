// sockets/gameSocket.js
// All Socket.io game event handling lives here.
// Mirrors Agario-Clone's socketMain.js pattern.

import { io } from "../server.js";

// Game settings
const settings = {
  tickRate: 33,       // ms per tick (30 fps)
  worldWidth: 1000,   // 3D world X bounds
  worldHeight: 1000,  // 3D world Z bounds
};

// Connected players map: socket.id -> player data
const players = new Map();
let tickInterval = null;

// ─── Game Loop ────────────────────────────────────────────────────────────────

function startGameLoop() {
  tickInterval = setInterval(() => {
    // Broadcast all player positions to everyone in the "game" room
    io.to("game").emit("tick", Array.from(players.values()));
  }, settings.tickRate);
}

function stopGameLoop() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// ─── Socket Events ────────────────────────────────────────────────────────────

io.on("connect", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Client sends "init" with their player name to join the game
  socket.on("init", (playerObject, ackCallback) => {
    // Start the game loop when the first player joins
    if (players.size === 0) {
      startGameLoop();
    }

    socket.join("game");

    const player = {
      id: socket.id,
      name: playerObject.playerName || "Unknown",
      x: 0,
      y: 0,
      z: 0,
      rotationY: 0,
    };

    players.set(socket.id, player);

    // Acknowledge back with initial game state
    if (ackCallback) {
      ackCallback({ settings, players: Array.from(players.values()) });
    }

    // Tell everyone else a new player joined
    socket.to("game").emit("player:joined", player);
    console.log(`Player "${player.name}" joined the game. Total: ${players.size}`);
  });

  // Client sends its updated position every frame ("tock" mirrors Agario-Clone)
  socket.on("tock", (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = data.x ?? player.x;
    player.y = data.y ?? player.y;
    player.z = data.z ?? player.z;
    player.rotationY = data.rotationY ?? player.rotationY;
  });

  // Player sends a chat message
  socket.on("chat:message", (message) => {
    const player = players.get(socket.id);
    if (!player) return;
    io.to("game").emit("chat:message", { player: player.name, message });
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`Player "${player.name}" disconnected.`);
      players.delete(socket.id);
      io.to("game").emit("player:left", { id: socket.id });
    }

    // Stop game loop when the last player leaves
    if (players.size === 0) {
      stopGameLoop();
    }
  });
});
