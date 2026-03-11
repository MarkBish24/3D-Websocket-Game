// routes/game.js
import express from "express";

const router = express.Router();

// Placeholder — add game REST endpoints here as needed
// e.g. fetching leaderboards, saved game states, etc.
router.get("/status", (req, res) => {
  res.json({ status: "ok", message: "Game server is running." });
});

export default router;
