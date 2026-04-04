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

  // Returns the raw RGB literal string based purely on the internal state
  getBaseRGB() {
    if (this.isSelected) return "123, 208, 224"; // Selected highlight color
    if (this.isHovered) return "255, 255, 255"; // Hover highlight color

    // 2. Temporarily disable Fog of War so we can actually see the map!
    // if (!this.isRevealed) return "47, 47, 47"; // #2f2f2f

    // 3. Type-based colors (spawn zones use owner to pick team color)
    switch (this.type) {
      case "spawn":
        // Owner is set by the server — no need to hard-code which hex is red/blue
        if (this.owner === "red") return "192, 57, 43"; // #c0392b
        if (this.owner === "blue") return "41, 128, 185"; // #2980b9
        return "127, 140, 141"; // #7f8c8d (spawn with no owner yet)

      case "checkpoint":
        return "255, 215, 0"; // Gold! (Was purple: 142, 68, 173)
      case "goal":
        return "243, 156, 18"; // #f39c12 (Orange/Gold)
      case "obstacle":
        return "20, 20, 20"; // Super dark grey/black

      // 4. Explored but ordinary tile
      case "basic":
      case "normal":
      default:
        // By default, if there is no special type, draw it slightly lighter than fog
        return "74, 74, 74"; // #4a4a4a 
    }
  }

  // Returns exactly what color this tile should render as based on state
  getRenderColor() {
    return `rgba(${this.getBaseRGB()}, 0.5)`; // Semi-transparent glass fill
  }

  // Returns exactly what color the outline of this tile should render as
  getStrokeColor() {
    return `rgba(${this.getBaseRGB()}, 1.0)`; // Bright solid neon outline
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
