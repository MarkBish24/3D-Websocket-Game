import { defineStore } from "pinia";
import { getLobbySocket } from "../plugins/lobbySocket.js";
import { getGameSocket } from "../plugins/gameSocket.js";

export const useLobbyStore = defineStore("lobby", {
  state: () => ({
    isSearching: false,
    currentRoom: null,
    _listenersInitialized: false,
  }),
  actions: {
    initSocketListeners() {
      const socket = getLobbySocket();
      if (!socket || this._listenersInitialized) return;
      this._listenersInitialized = true;

      socket.on("lobby:match_found", (room) => {
        this.isSearching = false;
        this.currentRoom = room;

        // Transition to the game namespace immediately!
        const gameSocket = getGameSocket();
        if (gameSocket && room.id) {
          gameSocket.emit("game:join", room.id);
        }
      });

      socket.on("lobby:match_searching", (room) => {
        this.isSearching = true;
        this.currentRoom = room;
      });

      socket.on("lobby:match_left", (room) => {
        // If we receive this, WE are the player left behind in the room! 
        // We need to go back to searching for a new opponent.
        this.isSearching = true;
        this.currentRoom = room;
      });
    },

    findMatch() {
      const socket = getLobbySocket();
      if (!socket) return;
      socket.emit("lobby:find_match", {
        userId: localStorage.getItem("userId"),
        socketId: socket.id,
      });
    },

    leaveMatch() {
      const socket = getLobbySocket();
      if (!socket) return;
      socket.emit("lobby:leave", {
        userId: localStorage.getItem("userId"),
      });

      // Synchronously clear our local state because we actually left the room
      // and won't hear any broadcasts from the server for this room anymore!
      this.isSearching = false;
      this.currentRoom = null;
    },
  },
});
