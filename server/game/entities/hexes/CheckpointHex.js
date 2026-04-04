import { PointHex } from "./PointHex.js";

export class CheckpointHex extends PointHex {
  constructor(q, r, s) {
    super(q, r, s);
    this.type = "checkpoint";
    // Checkpoints start entirely neutral and give an advantage when a player's units capture it
    this.owner = null; 
  }
}
