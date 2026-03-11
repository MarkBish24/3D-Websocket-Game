import "./config/env.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import playerRoutes from "./routes/players.js";
import gameRoutes from "./routes/game.js";
import { initGameSocket } from "./sockets/gameSocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app); // ← wrap Express for Socket.io

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../client/dist")));

connectDB(app);

// REST routes
app.use("/api/players", playerRoutes);
app.use("/api/game", gameRoutes);

// Socket.io
initGameSocket(io);

// Fallback — serve Vue app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
