import { Hex } from "./hex.js";

export class HexGrid {
  constructor(radius = 17, hexCount = 120) {
    this.hexes = new Map();
    this.radius = radius;
    this.hexCount = hexCount;
    this.generateGrid();
  }

  generateGrid() {
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const include = this.shouldIncludeHex(q, r, s);
        if (include) {
          this.addHex(new Hex(q, r, s));
        }
      }
    }
    this.keepLargestConnectedIsland();
    this.mirrorHexes();
  }

  shouldIncludeHex(q, r, s) {
    const distFromCenter = Math.abs(q) / this.radius; // 0 at q=0, 1 at edges
    return Math.random() > Math.pow(distFromCenter, 1.5) * 2;
  }

  keepLargestConnectedIsland() {
    const visited = new Set();
    const groups = [];

    for (const key of this.hexes.keys()) {
      if (visited.has(key)) continue;

      // BFS flood fill to find connected group

      const group = [];
      const queue = [key];

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        group.push(current);

        const hex = this.hexes.get(current);
        for (const neighbor of hex.neighbors()) {
          if (this.hexes.has(neighbor.key) && !visited.has(neighbor.key))
            queue.push(neighbor.key);
        }
      }
      groups.push(group);
    }

    const largest = groups.sort((a, b) => b.length - a.length)[0];
    const largestSet = new Set(largest);

    // Remove everything not in the largest group
    for (const key of this.hexes.keys()) {
      if (!largestSet.has(key)) {
        this.hexes.delete(key);
      }
    }
  }

  mirrorHexes() {
    const half = [...this.hexes.values()].filter((hex) => hex.q >= 0);
    this.hexes.clear();

    for (const hex of half) {
      this.addHex(hex);
      this.addHex(new Hex(-hex.q, -hex.r, -hex.s));
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
