import { Hex } from "./Hex.js";

export class PointHex extends Hex {
  constructor(q, r, s) {
    super(q, r, s);
    // Point of interest hexes are interactive layer tiles that players can capture/attack
    // Rather than having separate logics everywhere, we funnel health/capture logic through here
    this.hp = 100;
    this.isCaptured = false;
  }
}
