import { PointHex } from "./PointHex.js";

export class GoalHex extends PointHex {
  constructor(q, r, s, owner) {
    super(q, r, s);
    this.type = "goal";
    this.owner = owner; // Goal tiles belong to the defending player! Red tries to reach Blue's goal.
  }
}
