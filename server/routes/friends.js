import express from "express";
import authenticateToken from "../middleware/middleware.js";
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  searchFriends,
} from "../controllers/friends.js";

const router = express.Router();

router.get("/list", authenticateToken, getFriends);
router.get("/requests", authenticateToken, getFriendRequests);
router.post("/request", authenticateToken, sendFriendRequest);
router.put("/respond", authenticateToken, respondToFriendRequest);
router.get("/search", authenticateToken, searchFriends);

export default router;
