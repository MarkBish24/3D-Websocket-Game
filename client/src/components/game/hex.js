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
  }

  // Returns exactly what color this tile should render as based on state
  getRenderColor() {
    if (this.isSelected) {
      return "rgba(123, 208, 224, 0.4)"; // Selected highlight color
    }
    if (this.isHovered) {
      return "rgba(255, 255, 255, 0.4)"; // Hover highlight color
    }

    // 2. Unrevealed tiles are fog of war
    if (!this.isRevealed) {
      return "#2f2f2f";
    }

    // 3. Type-based colors (spawn zones use owner to pick team color)
    switch (this.type) {
      case "spawn":
        // Owner is set by the server — no need to hard-code which hex is red/blue
        if (this.owner === "red") return "#c0392b";
        if (this.owner === "blue") return "#2980b9";
        return "#7f8c8d"; // spawn with no owner yet (lobby/pre-game)

      case "checkpoint":
        return "#8e44ad";
      case "goal":
        return "#f39c12";
      case "obstacle":
        return "#1a1a1a";

      // 4. Explored but ordinary tile
      case "basic":
      default:
        return this.isExplored ? "#4a4a4a" : "#2f2f2f";
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
