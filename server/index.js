// index.js
// Entry point — run with: nodemon index.js
// Boots the server, then loads express routes and socket handlers.
// Dummy comment to trigger nodemon restart

import "./server.js"; // start Express + Socket.io + DB
import "./express/expressMain.js"; // register REST routes
import "./sockets/socialSocket.js"; // register social Socket.io events
import "./sockets/chatSocket.js"; // register chat Socket.io events
import "./sockets/lobbySocket.js"; // register matchmaking Socket.io events
import "./sockets/gameSocket.js"; // register game Socket.io events
