// express/expressMain.js
// Entry point for all Express route registration.
// Imports app from server.js, then wires up all REST routes.

import { app } from "../server.js";
import playerRoutes from "../routes/players.js";
import gameRoutes from "../routes/game.js";
import authRoutes from "../routes/auth.js";
import friendRoutes from "../routes/friends.js";
import chatRoutes from "../routes/chat.js";

// REST API routes
app.use("/api/players", playerRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat", chatRoutes);

// Fallback — serve Vue SPA for any unmatched route
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("*splat", (req, res) => {
  const indexPath = path.join(__dirname, "../../client/dist/index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .send(
        "Frontend build not found. If you are in dev mode, use the Vite dev server URL (usually http://localhost:5173).",
      );
  }
});

export default app;
