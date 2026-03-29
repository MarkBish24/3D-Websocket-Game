import { Hex } from "./hex.js";

export class HexGrid {
  constructor(radius = 8) {
    this.hexes = new Map();
    this.radius = radius;
    this.generateGrid();
  }

  generateGrid() {
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        this.addHex(new Hex(q, r, s));
      }
    }
  }

  addHex(hex) {
    this.hexes.set(hex.key, hex);
  }

  getHex(key) {
    return this.hexes.get(key);
  }

  serialize() {
    return {
      radius: this.radius,
      hexes: Array.from(this.hexes.values()).map((hex) => hex.serialize()),
    };
  }
}
