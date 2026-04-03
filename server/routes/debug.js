import express from "express";
import { debugNoiseMap } from "../controllers/debug.js";

const router = express.Router();

// Removed authenticateToken so you can instantly generate a temporary map without logging in!
router.get("/map", debugNoiseMap);

export default router;
