import { db } from "../config/db.js";

//gets all the friends of the user
export const getFriends = async (userId) => {
  return await db("players as p")
    .join("friendships as f", function () {
      this.on("p.id", "=", "f.requester_id").orOn(
        "p.id",
        "=",
        "f.addressee_id",
      );
    })
    .where("f.status", "accepted")
    .andWhere(function () {
      this.where("f.requester_id", userId).orWhere("f.addressee_id", userId);
    })
    .whereNot("p.id", userId)
    .select("p.id", "p.username", "p.picture");
};

//gets all the friend requests of the user
export const getFriendRequests = async (userId) => {
  return await db("friendships as f")
    .join("players as p", "p.id", "f.requester_id")
    .where("f.addressee_id", userId)
    .andWhere("f.status", "pending")
    .select("f.id", "p.id as requester_id", "p.username", "p.picture");
};

//sends a friend request
export const sendFriendRequest = async (requesterId, addresseeId) => {
  return await db("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  });
};

//handles the friend request
export const handleRequest = async (friendshipId, status) => {
  return await db("friendships")
    .where({ id: friendshipId })
    .update({ status: status, updated_at: db.fn.now() });
};

//searches for players
export const searchPlayers = async (query, userId) => {
  return await db("players")
    .whereNot("id", userId)
    .andWhere(function () {
      this.where("username", "ilike", `%${query}%`).orWhere(
        "email",
        "ilike",
        `%${query}%`,
      );
    })
    .select("id", "username", "picture");
};
