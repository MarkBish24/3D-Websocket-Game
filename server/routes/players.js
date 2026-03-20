import { authenticateToken } from "../middleware/middleware.js";
import { getPlayerById, updatePlayerById } from "../controllers/players.js";
import express from "express";

const router = express.Router();

router.get("/:id", authenticateToken, getPlayerById);
router.put("/:id", authenticateToken, updatePlayerById);

export default router;
