export class HexGrid {
  constructor() {
    this.hexes = new Map();
    this.selectedHex = null;
    this.hoveredHex = null;
  }

  addHex(hex) {
    this.hexes.set(`${hex.q},${hex.r},${hex.s}`, hex);
  }

  getHex(q, r) {
    return this.hexes.get(`${q},${r},${-q - r}`);
  }

  getHexes() {
    return this.hexes.values();
  }

  getSelectedHex() {
    return this.selectedHex;
  }

  getHoveredHex() {
    return this.hoveredHex;
  }

  setSelectedHex(hex) {
    this.selectedHex = hex;
  }

  setHoveredHex(hex) {
    this.hoveredHex = hex;
  }

  toggleSelectedHex(hex) {
    if (this.selectedHex === hex) {
      if (this.selectedHex) {
        this.selectedHex.toggleSelected();
        if (!this.selectedHex.isSelected) {
          this.selectedHex = null; // Clear if turned off
        }
      }
    } else {
      if (this.selectedHex) this.selectedHex.toggleSelected(); // Turn old off
      this.selectedHex = hex;
      if (this.selectedHex) this.selectedHex.toggleSelected(); // Turn new on
    }
  }

  toggleHoveredHex(hex) {
    if (this.hoveredHex === hex) {
      if (this.hoveredHex) {
        this.hoveredHex.toggleHovered();
        if (!this.hoveredHex.isHovered) {
          this.hoveredHex = null; // Clear if turned off
        }
      }
    } else {
      if (this.hoveredHex) this.hoveredHex.toggleHovered(); // Turn old off
      this.hoveredHex = hex;
      if (this.hoveredHex) this.hoveredHex.toggleHovered(); // Turn new on
    }
  }
}
