import * as debugServices from "../services/debug.js";

export const debugNoiseMap = (req, res) => {
  try {
    const { scale, threshold } = req.query;
    const grid = debugServices.debugNoiseMap({ scale, threshold });
    res.json(grid.serialize());
  } catch (error) {
    console.error("Error generating noise map:", error);
    res.status(500).json({ error: "Failed to generate noise map" });
  }
};
