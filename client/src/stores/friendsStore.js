import { defineStore } from "pinia";
import { getSocialSocket } from "../plugins/userSocket.js";

// This store is used to keep track of the online status of friends
export const useFriendsStore = defineStore("friends", {
  state: () => ({
    onlineFriends: new Map(),
    _listenersInitialized: false,
  }),
  actions: {
    // Initializes the socket listeners for the friends store
    initSocketListeners() {
      const socket = getSocialSocket();
      // Prevent multiple initializations
      if (!socket || this._listenersInitialized) return;
      this._listenersInitialized = true;

      // When the server sends the initial list of online friends
      socket.on("friends:online", (friends) => {
        const map = new Map();
        friends.forEach((friend) => {
          map.set(friend.id, friend);
        });
        this.onlineFriends = map;
      });

      // When a friend comes online
      socket.on("friend:online", (friend) => {
        const updated = new Map(this.onlineFriends);
        updated.set(friend.id, friend);

        this.onlineFriends = updated;
      });

      // When a friend goes offline
      socket.on("friend:offline", (friendId) => {
        const updated = new Map(this.onlineFriends);
        updated.delete(friendId);
        this.onlineFriends = updated;
      });
    },
    // Checks if a friend is online
    isFriendOnline(friendId) {
      return this.onlineFriends.has(friendId);
    },

    // returns
    getFriendBadgeColor(friendId) {
      if (!this.onlineFriends.has(friendId)) return "grey";
      const data = this.onlineFriends.get(friendId);
      return data.public ? "success" : "warning";
    },
  },
});
