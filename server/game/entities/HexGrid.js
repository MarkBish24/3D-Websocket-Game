import { Hex } from "./hex.js";
import { createNoise2D } from "simplex-noise";

export class HexGrid {
  constructor(radius = 25, hexCount = 120) {
    this.hexes = new Map();
    this.radius = radius;
    this.hexCount = hexCount;

    // Dual-stage noise layout
    this.noiseSettings = {
      macroScale: 0.05,       // Frequency of large continents
      microScale: 0.4,        // Frequency of edge fluff/jaggies
      microMix: 0.4,          // How far inward the jaggies erode the island
      islandCutoff: 0.8,      // How large the physical bounding area is
      lakeCutoff: 0.35,       // Cutoff for internal ocean holes vs land
    };

    // Instantiate generator natively for the very first map build on boot
    this.noise2D = createNoise2D();
    this.generateGrid();
  }

  // getNoise() and octave evaluation completely removed dynamically inside shouldIncludeHex()!

  generateGrid(noiseOverrides = null, forceReseed = false) {
    if (forceReseed || !this.noise2D) {
      // Re-seeding the generator creates an entirely separate random physical landscape
      this.noise2D = createNoise2D(); 
    }

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
    // 0 = physical center of math grid, 1 = absolute maximum edge radius
    const distFromCenter = Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) / this.radius;

    // Macro Layer: Base continents
    const macroNoise = (this.noise2D(q * this.noiseSettings.macroScale, r * this.noiseSettings.macroScale) + 1) / 2;

    // Micro Layer: Jagged fluffy erosion (we sample randomly away from the macro)
    const microNoise = (this.noise2D((q + 1000) * this.noiseSettings.microScale, (r + 1000) * this.noiseSettings.microScale) + 1) / 2;

    // Math: Outer edges erode strictly based on the micro frequency
    const erodedDist = distFromCenter + (microNoise * this.noiseSettings.microMix);

    // Constraints: Limit outer edge spread
    if (erodedDist > this.noiseSettings.islandCutoff) return false;

    // Constraints: Limit inner landmass density to carve out oceans
    return macroNoise > this.noiseSettings.lakeCutoff;
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
