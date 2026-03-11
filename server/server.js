// server.js
// Creates our Express app and Socket.io server, then exports them.
// This is NOT the entry point — index.js runs this.

import "./config/env.js";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app); // wrap Express so Socket.io can attach

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve the built Vue client in production
app.use(express.static(path.join(__dirname, "../client/dist")));

// Connect to PostgreSQL — stores pool on app.locals.db
connectDB(app);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
