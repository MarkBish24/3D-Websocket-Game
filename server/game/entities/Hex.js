export class Hex {
  constructor(q, r, s) {
    // math coordinates
    this.q = q;
    this.r = r;
    this.s = s;

    this.key = `${q},${r},${s}`;

    // metadata properties
    this.type = "basic"; // 'spawn', 'checkpoint', 'goal', 'obstacle'
    this.owner = null; // 'red', 'blue'

    // Future Mechanics
    this.units = [];
    this.isRevealed = false;
    this.isExplored = false;
  }

  distanceTo(targetHex) {
    return (
      (Math.abs(this.q - targetHex.q) +
        Math.abs(this.r - targetHex.r) +
        Math.abs(this.s - targetHex.s)) /
      2
    );
  }

  serialize() {
    return {
      q: this.q,
      r: this.r,
      s: this.s,
      key: this.key,
      type: this.type,
      owner: this.owner,
      units: this.units,
      isRevealed: this.isRevealed,
      isExplored: this.isExplored,
    };
  }
}
