import { Hex } from "./Hex.js";

export class ObstacleHex extends Hex {
  constructor(q, r, s) {
    super(q, r, s);
    this.type = "obstacle";
    this.isPassable = false;
  }
}
