import { Hex } from "./Hex.js";

export class PointHex extends Hex {
  constructor(q, r, s) {
    super(q, r, s);
    // Point of interest hexes are interactive layer tiles that players can capture/attack
    // Rather than having separate logics everywhere, we funnel health/capture logic through here
    this.hp = 100;
    this.isCaptured = false;

    // Arrays representing physical units present on this tile
    this.units = [];
    this.maxUnits = 10;
  }

  addUnit(unit) {
    if (this.units.length < this.maxUnits) {
      this.units.push(unit);
      return true; // Successfully added
    }
    return false; // Tile is full!
  }

  removeUnit(unit) {
    const index = this.units.indexOf(unit);
    if (index > -1) {
      this.units.splice(index, 1);
      return true; // Successfully removed
    }
    return false; // Unit not found on this tile
  }
}
