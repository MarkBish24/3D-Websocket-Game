import { authenticateToken } from "../middleware/middleware.js";
import {
  getPlayerById,
  updatePlayerById,
  updatePlayerPublicStatus,
  completePlayerSetup,
} from "../controllers/players.js";
import express from "express";

const router = express.Router();

router.get("/:id", authenticateToken, getPlayerById);
router.put("/:id", authenticateToken, updatePlayerById);
router.put("/:id/public", authenticateToken, updatePlayerPublicStatus);
router.put("/:id/setup", authenticateToken, completePlayerSetup);

export default router;
