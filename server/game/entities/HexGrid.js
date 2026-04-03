import { Hex } from "./hex.js";
import { createNoise2D } from "simplex-noise";

export class HexGrid {
  constructor(radius = 25, hexCount = 120) {
    this.hexes = new Map();
    this.radius = radius;
    this.hexCount = hexCount;

    // noise parameters
    this.noiseSettings = {
      scale: 0.1, // Scale of macro terrain
      threshold: 0.8, // Island size cutoff (higher = larger island)
      octaves: 3, // Number of layers
      persistence: 0.5,
      lacunarity: 2,
    };

    // Instantiate generator
    this.noise2D = createNoise2D();

    this.generateGrid();
  }

  getNoise(x, y) {
    let value = 0;
    let maxValue = 0;
    let amplitude = 1;
    let frequency = this.noiseSettings.scale;

    for (let i = 0; i < this.noiseSettings.octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= this.noiseSettings.persistence;
      frequency *= this.noiseSettings.lacunarity;
    }

    return value / maxValue;
  }

  generateGrid(noiseOverrides = null) {
    if (noiseOverrides) {
      this.noiseSettings = { ...this.noiseSettings, ...noiseOverrides };
    }

    this.hexes.clear();

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
    // Distance from center (0 = center, 1 = absolute edge radius)
    const distFromCenter =
      Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) / this.radius;

    // Macro terrain: Create continents & large islands
    // Simplex noise returns -1 to 1. Normalize it to 0 to 1
    const macroNoise = (this.getNoise(q, r) + 1) / 2;

    // Edge Fluff System
    // We sample a high-frequency area by adding a huge mathematical offset
    const edgeNoise = (this.getNoise(q + 1000, r + 1000) + 1) / 2;

    // Erode the physical edges of the map randomly using the "fluff"
    const erodedDist = distFromCenter + edgeNoise * 0.4;

    // Cut off outer bounds to guarantee it looks like an island
    if (erodedDist > this.noiseSettings.threshold) return false;

    // Cut out random lakes/oceans from the interior map
    return macroNoise > 0.35;
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
