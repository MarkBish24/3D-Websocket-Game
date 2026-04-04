import {
  Hex,
  PointHex,
  ObstacleHex,
  BaseHex,
  CheckpointHex,
  GoalHex,
} from "./hexes/index.js";
import { createNoise2D } from "simplex-noise";

export class HexGrid {
  constructor(radius = 25, hexCount = 120) {
    this.hexes = new Map();
    this.radius = radius;
    this.hexCount = hexCount;

    // Dual-stage noise layout
    this.noiseSettings = {
      macroScale: 0.13, // Frequency of large continents
      microScale: 0.35, // Frequency of edge fluff/jaggies
      microMix: 0.2, // How far inward the jaggies erode the island
      islandCutoff: 1.1, // How large the physical bounding area is
      lakeCutoff: 0.4, // Cutoff for internal ocean holes vs land
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
        const includeType = this.shouldIncludeHex(q, r, s);
        if (includeType === "ring" || includeType === "normal") {
          const hex = new Hex(q, r, s);
          hex.type = includeType;
          this.addHex(hex);
        } else if (includeType === "obstacle") {
          const hex = new ObstacleHex(q, r, s);
          this.addHex(hex);
        } else if (includeType === "blank") {
          continue;
        }
      }
    }
    this.keepLargestConnectedIsland();
    this.mirrorHexes();
    this.seedSpecialTiles();
  }

  shouldIncludeHex(q, r, s) {
    // Convert Pointy-Top Axial coordinates into pure Euclidean Geometric spacing (assuming hex side = 1)
    const x = Math.sqrt(3) * (q + r / 2);
    const y = (3 / 2) * r;
    const euclidDist = Math.sqrt(x * x + y * y);

    // The boundary hexagon's closest flat edge is actually at `this.radius * 1.5`.
    // We pick 1.4 to establish a perfectly inscribed geometric circle securely inside the array limits
    const maxCircleRadius = this.radius * 1.4;

    // THE ARENA RING: Force the absolute edge into a perfect, uniform geometric circle track
    // Max distance from any point to nearest hex center is 1.0, so ±0.9 guarantees an unbroken solid track ring
    if (Math.abs(euclidDist - maxCircleRadius) <= 0.95) {
      return "ring";
    }

    // Clip away the messy jagged hexagon corners! This shapes the absolute world into a perfect circular cylinder
    if (euclidDist > maxCircleRadius) {
      return "blank";
    }

    // Normalized distance (0 = center, 1 = true geometric circle edge) replaces old axial math
    const distFromCenter = euclidDist / maxCircleRadius;

    // Macro Layer: Base continents
    const macroNoise =
      (this.noise2D(
        q * this.noiseSettings.macroScale,
        r * this.noiseSettings.macroScale,
      ) +
        1) /
      2;

    // Micro Layer: Jagged fluffy erosion (we sample randomly away from the macro)
    const microNoise =
      (this.noise2D(
        (q + 1000) * this.noiseSettings.microScale,
        (r + 1000) * this.noiseSettings.microScale,
      ) +
        1) /
      2;

    // Math: Outer edges erode strictly based on the micro frequency
    const erodedDist =
      distFromCenter + microNoise * this.noiseSettings.microMix;

    // Constraints: Limit outer edge spread
    if (erodedDist > this.noiseSettings.islandCutoff) return "obstacle";

    // Constraints: Limit inner landmass density to carve out oceans
    return macroNoise > this.noiseSettings.lakeCutoff ? "normal" : "obstacle";
  }

  keepLargestConnectedIsland() {
    const visited = new Set();
    const groups = [];

    for (const key of this.hexes.keys()) {
      if (visited.has(key)) continue;
      // Skip impassable tiles so we only map out solid land
      if (!this.hexes.get(key).isPassable) continue;

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
          if (
            this.hexes.has(neighbor.key) &&
            !visited.has(neighbor.key) &&
            this.hexes.get(neighbor.key).isPassable === true
          )
            queue.push(neighbor.key);
        }
      }
      groups.push(group);
    }

    const largest = groups.sort((a, b) => b.length - a.length)[0];
    const largestSet = new Set(largest);

    // Replace everything not in the largest group with an Obstacle
    for (const key of this.hexes.keys()) {
      if (!largestSet.has(key)) {
        const existingHex = this.hexes.get(key);
        // We preserve the "ring" tiles no matter what, and we ignore things that are already obstacles
        if (existingHex.type !== "ring" && existingHex.type !== "obstacle") {
          this.hexes.set(
            key,
            new ObstacleHex(existingHex.q, existingHex.r, existingHex.s),
          );
        }
      }
    }
  }

  mirrorHexes() {
    const half = [...this.hexes.values()].filter((hex) => hex.q >= 0);
    this.hexes.clear();

    for (const hex of half) {
      this.addHex(hex);
      const MirroredClass = hex.constructor;
      const flippedHex = new MirroredClass(-hex.q, -hex.r, -hex.s);
      this.addHex(flippedHex);
    }
  }

  seedSpecialTiles() {
    // 1. Identify all valid land tiles
    const passables = Array.from(this.hexes.values()).filter(
      (hex) => hex.isPassable && hex.type !== "ring",
    );

    if (passables.length === 0) return;

    // 2. Sort by q-coordinate to find the leftmost and rightmost hexes
    passables.sort((a, b) => a.q - b.q);

    const p1Core = passables[0];
    const p2Core = passables[passables.length - 1];

    this.convertAreaToBase(p1Core, "red", 20);
    this.convertAreaToBase(p2Core, "blue", 20);

    this.hexes.set(
      p1Core.key,
      new GoalHex(p1Core.q, p1Core.r, p1Core.s, "red"),
    );
    this.hexes.set(
      p2Core.key,
      new GoalHex(p2Core.q, p2Core.r, p2Core.s, "blue"),
    );

    // 3. Find the geometric center of the map
    if (this.hexes.has("0,0,0") && this.hexes.get("0,0,0").isPassable) {
      const center = this.hexes.get("0,0,0");
      // 4. Convert the center hex to a checkpoint
      this.hexes.set(
        center.key,
        new CheckpointHex(center.q, center.r, center.s),
      );
    }
  }

  convertAreaToBase(startHex, owner, radius) {
    const queue = [startHex];
    const visited = new Set([startHex.key]);

    while (queue.length > 0) {
      const current = queue.shift();
      this.hexes.set(
        current.key,
        new BaseHex(current.q, current.r, current.s, owner),
      );

      if (visited.size >= radius) break;

      for (const neighbor of current.neighbors()) {
        if (
          this.hexes.has(neighbor.key) &&
          !visited.has(neighbor.key) &&
          this.hexes.get(neighbor.key).isPassable === true
        ) {
          visited.add(neighbor.key);
          queue.push(neighbor);
        }
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
