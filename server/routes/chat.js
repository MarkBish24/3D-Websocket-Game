import express from "express";
import { authenticateToken } from "../middleware/middleware.js";
import {
  getChatHistory,
  insertMessage,
  getOrCreatePrivateChat,
} from "../controllers/chat.js";

const router = express.Router();

router.get("/history/:chatId", authenticateToken, getChatHistory);
router.post("/message", authenticateToken, insertMessage);
router.get("/private/:friendId", authenticateToken, getOrCreatePrivateChat);

export default router;
