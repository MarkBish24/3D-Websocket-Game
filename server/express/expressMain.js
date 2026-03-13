// express/expressMain.js
// Entry point for all Express route registration.
// Imports app from server.js, then wires up all REST routes.

import { app } from "../server.js";
import playerRoutes from "../routes/players.js";
import gameRoutes from "../routes/game.js";
import authRoutes from "../routes/auth.js";

// REST API routes
app.use("/api/players", playerRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/auth", authRoutes);

// Fallback — serve Vue SPA for any unmatched route
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

export default app;
