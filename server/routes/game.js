// routes/game.js
import express from "express";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({ status: "ok", message: "Game server is running." });
});

export default router;
