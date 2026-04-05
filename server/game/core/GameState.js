import { HexGrid } from "../entities/HexGrid.js";

export class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    this.board = new HexGrid();
    this.players = new Map();
    this.tickInterval = null;

    this.units = new Set();

    // Scrape the newly generated board and add any natively spawned units to our tracking Set!
    for (const hex of this.board.hexes.values()) {
      if (hex.units && hex.units.length > 0) {
        for (const unit of hex.units) {
          this.units.add(unit);
        }
      }
    }
  }

  startSimulationLoop(onStateChangeCallBack) {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      let stateChanged = false;

      // check every hex on the board
      for (const unit of this.units) {
        // check for unit movement
        if (!unit.isMoving) continue;

        if (unit.hasPath()) {
          const oldHex = this.board.getHex(`${unit.q},${unit.r},${unit.s}`);

          // 1. Ask the unit to process its own internal move
          unit.move();

          // 2. The unit's internal coordinates were just updated to the next tile!
          // So let's find the new tile on the grid...
          const nextHex = this.board.getHex(`${unit.q},${unit.r},${unit.s}`);

          if (oldHex && nextHex) {
            // 3. Remove the unit from the old hex's physical array
            oldHex.removeUnit(unit);

            // 4. Add the unit to the new hex's physical array
            nextHex.addUnit(unit);

            stateChanged = true;
          } else if (!nextHex) {
            // Safety fallback: if the path takes us off the map somehow, stop moving!
            unit.stopMoving();
          }
        }
      }

      if (stateChanged && onStateChangeCallBack) {
        onStateChangeCallBack();
      }
    }, 500);
  }

  addPlayer(user) {
    this.players.set(user.id, user);
  }

  removePlayer(userId) {
    this.players.delete(userId);
  }

  getPlayer(userId) {
    return this.players.get(userId);
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  getPlayersCount() {
    return this.players.size;
  }

  getBoard() {
    return this.board;
  }

  getBoardSize() {
    return this.board.radius * 2 + 1;
  }

  getBoardHex(key) {
    return this.board.getHex(key);
  }

  getBoardHexesCount() {
    return this.board.hexes.size;
  }

  serialize() {
    return {
      roomId: this.roomId,
      status: this.status,
      turnNumber: this.turnNumber,
      board: this.board.serialize(),
      players: Array.from(this.players.values()).map((player) => ({
        id: player.id,
        username: player.username,
      })),
    };
  }

  addUnit(unit) {
    this.units.add(unit);
  }
  removeUnit(unit) {
    this.units.delete(unit);
  }
}
