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
  }

  followPath(path) {
    this.path = path;
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
