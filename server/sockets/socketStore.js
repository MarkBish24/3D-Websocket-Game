// ─── Socket.io User Socket Management ─────────────────────────────────────────

// Map: userId → Set<socketId>
const userSockets = new Map();

export const addSocketToUser = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
};

export const removeSocketFromUser = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    return;
  }
  userSockets.get(userId).delete(socketId);
  if (userSockets.get(userId).size === 0) {
    userSockets.delete(userId);
  }
};

export const getSocketsForUser = (userId) => {
  return userSockets.get(userId) || new Set();
};
