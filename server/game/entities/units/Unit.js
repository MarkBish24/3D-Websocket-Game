class Unit {
  constructor(q, r, s, owner) {
    // position
    this.q = q;
    this.r = r;
    this.s = s;

    // state
    this.owner = owner;
    this.path = [];

    this.size = 1;

    this.isMoving = false;
    this.moveSpeed = 1;
  }

  followPath(path) {
    this.path = [...path];
    this.isMoving = true;
  }

  stopMoving() {
    this.isMoving = false;
  }

  hasPath() {
    return this.path.length > 0;
  }

  move() {
    if (!this.isMoving) return;
    if (!this.hasPath()) {
      this.isMoving = false;
      return;
    }
    const nextHex = this.path.shift();
    this.q = nextHex.q;
    this.r = nextHex.r;
    this.s = nextHex.s;
  }

  serialize() {
    return {
      q: this.q,
      r: this.r,
      s: this.s,
      owner: this.owner,
      path: this.path,
    };
  }
}

export { Unit };
