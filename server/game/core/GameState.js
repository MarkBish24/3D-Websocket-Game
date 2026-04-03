import { HexGrid } from "../entities/HexGrid.js";

export class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    this.board = new HexGrid();
    this.players = new Map();
    this.status = "waiting";
    this.turnNumber = 1;
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
}
