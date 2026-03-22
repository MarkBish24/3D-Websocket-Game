import { defineStore } from "pinia";
import { getSocialSocket } from "../plugins/userSocket.js";

// This store is used to keep track of the online status of friends
export const useFriendsStore = defineStore("friends", {
  state: () => ({
    onlineFriends: new Map(),
    _listenersInitialized: false,
    toast: { show: false, title: "", message: "" },
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

      // When we receive a friend request
      socket.on("friend:request_received", (request) => {
        this.showToast(
          "Friend Request",
          `You received a friend request from ${request.username}`,
        );
      });

      // When someone Accepts our request
      socket.on("friend:request_accepted", (actor) => {
        this.showToast(
          "Friend Request Accepted",
          `${actor.username} accepted your friend request`,
        );
      });

      // When someone Declines our request
      socket.on("friend:request_declined", (actor) => {
        this.showToast(
          "Friend Request Declined",
          `${actor.username} declined your friend request`,
        );
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

    showToast(title, message) {
      this.toast = { show: true, title, message };
    },
  },
});
