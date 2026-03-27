export class Hex {
  constructor(q, r, s) {
    // math coordinates
    this.q = q;
    this.r = r;
    this.s = s;

    // metadata properties
    this.type = "basic"; // 'spawn', 'checkpoint', 'goal', 'obstacle'
    this.owner = null; // 'red', 'blue'
    this.color = "#2f2f2f"; // Default fog of war Color

    // Future Mechanics
    this.units = [];
    this.isRevealed = false;
    this.isExplored = false;
    this.isHovered = false; // True when the mouse points directly here
  }

  // Returns exactly what color this tile should render as based on state
  getRenderColor() {
    if (this.isHovered) {
      return "rgba(255, 255, 255, 0.4)"; // Hover highlight color
    }
    return this.color;
  }

  distanceTo(targetHex) {
    return (
      (Math.abs(this.q - targetHex.q) +
        Math.abs(this.r - targetHex.r) +
        Math.abs(this.s - targetHex.s)) /
      2
    );
  }
}
