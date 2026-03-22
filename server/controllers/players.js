// controllers/players.js
import * as playerServices from "../services/players.js";

export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await playerServices.getPlayerById(id);
    res.status(200).json(player);
  } catch (error) {
    console.error("Error getting player by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error getting player by ID" });
  }
};

export const updatePlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: authenticatedUserId } = req.user;

    // Security Check: Only the owner can edit their profile
    if (parseInt(id) !== authenticatedUserId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this profile" });
    }

    const player = await playerServices.updatePlayerById(id, req.body);
    res.status(200).json(player);
  } catch (error) {
    console.error("Error updating player by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error updating player by ID" });
  }
};

export const updatePlayerPublicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: authenticatedUserId } = req.user;

    // Security Check: Only the owner can edit their profile
    if (parseInt(id) !== authenticatedUserId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this profile" });
    }

    const player = await playerServices.updatePlayerPublicStatus(
      id,
      req.body.public,
    );
    res.status(200).json(player);
  } catch (error) {
    console.error("Error updating player by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error updating player by ID" });
  }
};

export const completePlayerSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: authenticateUserId } = req.user;
    const { username } = req.body;

    if (parseInt(id) !== authenticateUserId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to complete this setup" });
    }

    const player = await playerServices.completePlayerSetup(id, username);
    res.status(200).json(player);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "Username is already taken" });
    }
    console.error("Error completing player setup:", error);
    res
      .status(500)
      .json({ message: "Internal server error completing player setup" });
  }
};
