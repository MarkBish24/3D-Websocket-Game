import { defineStore } from "pinia";
import { getGameSocket } from "../plugins/gameSocket.js";

export const useGameStore = defineStore("game", {
  state: () => ({
    currentRoom: null,
    _listenersInitialized: false,
  }),
  actions: {
    initSocketListeners() {
      const socket = getGameSocket();
      if (!socket || this._listenersInitialized) return;
      this._listenersInitialized = true;

      socket.on("game:state_sync", (data) => {
        this.currentRoom = data.matchData;
      });
    },
  },
});
