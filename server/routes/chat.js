import express from "express";
import { authenticateToken } from "../middleware/middleware.js";
import {
  getChatHistory,
  insertMessage,
} from "../controllers/chat.js";

const router = express.Router();

router.get("/history/:chatId", authenticateToken, getChatHistory);
router.post("/message", authenticateToken, insertMessage);

export default router;