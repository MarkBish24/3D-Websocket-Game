import * as friendsService from "../services/friends.js";
import { getPlayerById } from "../services/players.js";
import { io } from "../server.js";

export const getFriends = async (req, res) => {
  try {
    const { id } = req.user;
    const friends = await friendsService.getFriends(id);
    res.json(friends);
  } catch (error) {
    console.error("Error getting friends:", error);
    res.status(500).json({ message: "Internal server error getting friends" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const { id } = req.user;
    const requests = await friendsService.getFriendRequests(id);
    res.json(requests);
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res
      .status(500)
      .json({ message: "Internal server error getting friend requests" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id: requesterId } = req.user;
    const { addresseeId } = req.body;

    // save request to database
    const friendship = await friendsService.sendFriendRequest(requesterId, addresseeId);

    // get requester info
    const requester = await getPlayerById(requesterId);

    // send request to addressee
    io.of("/social").to(`user:${addresseeId}`).emit("friend:request_received", {
      id: friendship.id,
      username: requester.username,
      picture: requester.picture,
    });
    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);

    // 1. Check for specific validation errors and return early
    if (
      error.message === "Already friends" ||
      error.message === "Friend request already pending"
    ) {
      return res.status(400).json({ message: error.message });
    }

    // 2. Fallback to a general error if it's not a validation error
    res
      .status(500)
      .json({ message: "Internal server error sending friend request" });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { id: actorId } = req.user;
    const { friendshipId, status } = req.body; // status: 'accepted' or 'declined'

    const { friendship } = await friendsService.handleRequest(
      friendshipId,
      status,
      actorId,
    );

    // get addressee info
    const actor = await getPlayerById(actorId);

    // Notify the original requester
    io.of("/social")
      .to(`user:${friendship.requester_id}`)
      .emit(`friend:request_${status}`, {
        id: actor.id,
        username: actor.username,
        picture: actor.picture,
      });

    res.json({ message: `Request ${status}` });
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res
      .status(500)
      .json({ message: "Internal server error responding to friend request" });
  }
};

export const searchFriends = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { query } = req.query;
    const players = await friendsService.searchPlayers(query, userId);
    res.json(players);
  } catch (error) {
    console.error("Error searching for friends:", error);
    res
      .status(500)
      .json({ message: "Internal server error searching for friends" });
  }
};
