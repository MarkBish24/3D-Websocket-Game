export class Hex {
  constructor(serverData) {
    // math coordinates
    this.q = serverData.q;
    this.r = serverData.r;
    this.s = serverData.s;

    // metadata properties
    this.type = serverData.type ?? "basic"; // 'spawn', 'checkpoint', 'goal', 'obstacle'
    this.owner = serverData.owner ?? null; // 'red', 'blue', null

    // Future Mechanics
    this.units = serverData.units ?? [];
    this.isRevealed = serverData.isRevealed;
    this.isExplored = serverData.isExplored;
    this.isHovered = false; // True when the mouse points directly here
    this.isSelected = false; // True when user clicks the tile

    this.isOnPath = false;
    this.pathMode = null; // 'astar' | 'drag'
  }

  // Returns exactly what fill color this tile should render as, given the active theme palette
  getRenderColor(gameColors) {
    if (this.isHovered)  return gameColors.hoverFill;

    if (this.isOnPath && this.pathMode === "drag")  return gameColors.pathDragFill;
    if (this.isOnPath && this.pathMode === "astar") return gameColors.pathAstarFill;

    switch (this.type) {
      case "spawn":
      case "base":
        if (this.owner === "red")   return gameColors.redBaseFill;
        if (this.owner === "green") return gameColors.greenBaseFill;
        return gameColors.hexNormalFill;
      case "goal":
        return gameColors.goalFill;
      case "checkpoint":
        return gameColors.checkpointFill;
      case "obstacle":
        return gameColors.hexObstacleFill;
      case "ring":
        return gameColors.hexRingFill;
      default:
        return gameColors.hexNormalFill;
    }
  }

  // Returns exactly what stroke/outline color this tile should render as
  getStrokeColor(gameColors) {
    if (this.isHovered)  return gameColors.hoverStroke;

    if (this.isOnPath && this.pathMode === "drag")  return gameColors.pathDragStroke;
    if (this.isOnPath && this.pathMode === "astar") return gameColors.pathAstarStroke;

    switch (this.type) {
      case "spawn":
      case "base":
        if (this.owner === "red")   return gameColors.redBaseStroke;
        if (this.owner === "green") return gameColors.greenBaseStroke;
        return gameColors.hexNormalStroke;
      case "goal":
        return gameColors.goalStroke;
      case "checkpoint":
        return gameColors.checkpointStroke;
      case "obstacle":
        return gameColors.hexObstacleStroke;
      case "ring":
        return gameColors.hexRingStroke;
      default:
        return gameColors.hexNormalStroke;
    }
  }

  distanceTo(targetHex) {
    return (
      (Math.abs(this.q - targetHex.q) +
        Math.abs(this.r - targetHex.r) +
        Math.abs(this.s - targetHex.s)) /
      2
    );
  }

  setOnPath(val, mode = null) {
    this.isOnPath = val;
    this.pathMode = val ? mode : null;
  }

  toggleSelected() {
    this.isSelected = !this.isSelected;
  }

  toggleHovered() {
    this.isHovered = !this.isHovered;
  }

  getHoveredStatus() {
    return this.isHovered;
  }

  getSelectedStatus() {
    return this.isSelected;
  }
}
