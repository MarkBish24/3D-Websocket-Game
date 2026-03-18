import { db } from "../config/db.js";

const getPlayerById = async (id) => {
  try {
    const player = await db("players").where({ id }).first();
    return player;
  } catch (error) {
    console.log("Error getting player with ID", error);
    throw error;
  }
};

const updatePlayerById = async (id, player) => {
  try {
    const [updatedPlayer] = await db("players")
      .where({ id })
      .update(player)
      .returning("*");
    return updatedPlayer;
  } catch (error) {
    console.log("Error updating player with ID", error);
    throw error;
  }
};

export { getPlayerById, updatePlayerById };
