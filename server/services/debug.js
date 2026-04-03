import { HexGrid } from "../game/entities/HexGrid.js";

export const debugNoiseMap = (options = {}) => {
  const noiseConfig = {};
  if (options.scale) noiseConfig.scale = parseFloat(options.scale);
  if (options.threshold) noiseConfig.threshold = parseFloat(options.threshold);

  const grid = new HexGrid();
  // Force a re-generation with the API noise variables applied
  grid.generateGrid(noiseConfig);
  return grid;
};
