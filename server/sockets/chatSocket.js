import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";

// create the new namespace
const chatNamespace = io.of("/chat");

chatNamespace.use(authenticateSocket);

chatNamespace.on("connect", (socket) => {
  if (!socket.user) {
    console.log("User not authenticated");
    socket.disconnect();
    return;
  }

  const user = socket.user;
  console.log(`User ${user.id} connected to /chat`);

  // Join a specific chat room by chatId
  socket.on("chat:join", (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${user.id} joined chat room ${chatId}`);
  });

  // Leave a chat room
  socket.on("chat:leave", (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${user.id} left chat room ${chatId}`);
  });

  // handle incoming messages
  socket.on("chat:message", (data) => {
    const { chatId, message } = data;
    console.log(
      `User ${user.id} sent message to chat room ${chatId}: ${message}`,
    );

    chatNamespace.to(`chat_${chatId}`).emit("chat:message", {
      chatId,
      message,
      senderId: user.id,
      senderUsername: user.username,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${user.id} disconnected from /chat`);
  });
});
