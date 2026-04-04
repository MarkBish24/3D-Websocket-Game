import { Hex } from "./Hex.js";

export class BaseHex extends Hex {
  constructor(q, r, s, owner) {
    super(q, r, s);
    // This allows the frontend hex.js to use its `case "spawn":` red/blue color rendering
    this.type = "spawn"; 
    // The player this territory explicitly belongs to ("red" or "blue")
    this.owner = owner; 
  }
}
