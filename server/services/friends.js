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
  // check existing friendship
  const existingFriendship = await db("friendships")
    .where(function () {
      this.where({
        requester_id: requesterId,
        addressee_id: addresseeId,
      }).orWhere({ requester_id: addresseeId, addressee_id: requesterId });
    })
    .first();

  if (existingFriendship) {
    if (existingFriendship.status === "accepted") {
      throw new Error("Already friends");
    } else if (existingFriendship.status === "pending") {
      throw new Error("Friend request already pending");
    }
  }

  // 2. Perform transactional insert
  return await db.transaction(async (trx) => {
    // Insert friendship and get the ID back
    const [friendship] = await trx("friendships")
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: "pending",
      })
      .returning("*"); // Get the full object back

    // Log the event using the new ID
    await trx("friendship_events").insert({
      friendship_id: friendship.id,
      actor_id: requesterId,
      event: "requested",
    });

    return friendship;
  });
};

//handles the friend request
export const handleRequest = async (friendshipId, status, actorId) => {
  return await db.transaction(async (trx) => {
    const [friendship] = await trx("friendships")
      .where({ id: friendshipId })
      .update({ status: status, updated_at: db.fn.now() })
      .returning("*");

    const [friendshipEvent] = await trx("friendship_events")
      .insert({
        friendship_id: friendship.id,
        actor_id: actorId,
        event: status,
      })
      .returning("*");

    return { friendship, friendshipEvent };
  });
};

//searches for players with friendship status relative to current user
export const searchPlayers = async (query, userId) => {
  return await db("players as p")
    .leftJoin("friendships as f", function () {
      this.on(function () {
        // Case 1: You sent the request
        this.on("p.id", "=", "f.addressee_id").andOn(
          "f.requester_id",
          "=",
          db.raw("?", [userId]),
        );
      }).orOn(function () {
        // Case 2: They sent the request
        this.on("p.id", "=", "f.requester_id").andOn(
          "f.addressee_id",
          "=",
          db.raw("?", [userId]),
        );
      });
    })
    .whereNot("p.id", userId)
    .andWhere(function () {
      this.where("p.username", "ilike", `%${query}%`).orWhere(
        "p.email",
        "ilike",
        `%${query}%`,
      );
    })
    .select("p.id", "p.username", "p.picture", "f.status as friendship_status");
};
