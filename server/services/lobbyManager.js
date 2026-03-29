import crypto from "crypto";

class Room {
  constructor(userId, socketId, maxPlayers = 2) {
    this.id = crypto.randomUUID();
    this.players = [{ userId, socketId }];
    this.maxPlayers = maxPlayers;
    this.state = "waiting"; // 'waiting' or 'playing'
  }

  addPlayer(userId, socketId) {
    if (this.isFull()) return false;
    this.players.push({ userId, socketId });
    if (this.isFull()) {
      this.state = "playing";
    }
    return true;
  }

  removePlayer(userId) {
    this.players = this.players.filter((p) => p.userId !== userId);
    this.state = "waiting"; // if someone leaves, might revert to waiting or just dissolve
  }

  isFull() {
    return this.players.length >= this.maxPlayers;
  }

  isEmpty() {
    return this.players.length === 0;
  }
}

const activeRooms = new Map();
const roomsById = new Map();
const waitingQueue = [];

export const findOrCreateRoom = (userId, socketId) => {
  // check if user is already in a room
  if (activeRooms.has(userId)) {
    return activeRooms.get(userId);
  }

  // check if there is a waiting room
  if (waitingQueue.length > 0) {
    const room = waitingQueue.shift();
    room.addPlayer(userId, socketId);
    activeRooms.set(userId, room);
    roomsById.set(room.id, room);
    return room;
  }

  // create a new room
  const room = new Room(userId, socketId);
  activeRooms.set(userId, room);
  roomsById.set(room.id, room);
  waitingQueue.push(room);
  return room;
};

export const leaveRoom = (userId) => {
  if (!activeRooms.has(userId)) return null;
  const room = activeRooms.get(userId);

  // Remove player from the room
  room.removePlayer(userId);
  activeRooms.delete(userId);

  // If the room is now empty, ensure it's removed from the waitingQueue if it was there
  if (room.isEmpty()) {
    roomsById.delete(room.id);
    const index = waitingQueue.indexOf(room);

    if (index !== -1) waitingQueue.splice(index, 1);
  } else if (room.state === "waiting") {
    // If someone left and the room isn't empty, it goes back in the queue
    if (!waitingQueue.includes(room)) {
      waitingQueue.push(room);
    }
  }

  return room;
};

export const getRoomById = (roomId) => {
  return roomsById.get(roomId);
};
