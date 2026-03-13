// index.js
// Entry point — run with: nodemon index.js
// Boots the server, then loads express routes and socket handlers.

import "./server.js"; // start Express + Socket.io + DB
import "./express/expressMain.js"; // register REST routes
import "./sockets/gameSocket.js"; // register Socket.io events
