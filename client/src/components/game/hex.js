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
    this.units = []; // Array of unit objects
    this.isRevealed = false; // Whether the hex is revealed by a unit
    this.isExplored = false; // Whether the hex has been explored by a unit
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
