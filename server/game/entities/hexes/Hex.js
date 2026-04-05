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
    this.maxUnits = 10;
    this.isRevealed = false;
    this.isExplored = false;

    // Movement & Vision Constraints
    this.isPassable = true;
    this.blocksVision = false;

  }

  addUnit(unit) {
    if (this.units.length < this.maxUnits) {
      this.units.push(unit);
      return true;
    }
    return false;
  }

  removeUnit(unit) {
    const index = this.units.indexOf(unit);
    if (index > -1) {
      this.units.splice(index, 1);
      return true;
    }
    return false;
  }

  hasUnits() {
    return this.units.length > 0;
  }

  getUnits() {
    return this.units;
  }

  distanceTo(targetHex) {
    return (
      (Math.abs(this.q - targetHex.q) +
        Math.abs(this.r - targetHex.r) +
        Math.abs(this.s - targetHex.s)) /
      2
    );
  }

  neighbors() {
    const directions = [
      [+1, -1, 0],
      [+1, 0, -1],
      [0, +1, -1],
      [-1, +1, 0],
      [-1, 0, +1],
      [0, -1, +1],
    ];

    return directions.map(([dq, dr, ds]) => {
      return new Hex(this.q + dq, this.r + dr, this.s + ds);
    });
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
      isPassable: this.isPassable,
      blocksVision: this.blocksVision,
    };
  }
}
