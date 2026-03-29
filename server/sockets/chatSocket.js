import { io } from "../server.js";
import { authenticateSocket } from "../middleware/middleware.js";
import * as chatService from "../services/chat.js";

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
  console.log(`[Chat] ${user.username}:${user.id} connected to /chat`);

  // Join a specific chat room by chatId
  socket.on("chat:join", (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`[Chat] ${user.username}:${user.id} joined chat room ${chatId}`);
  });

  // Leave a chat room
  socket.on("chat:leave", (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`[Chat] ${user.username}:${user.id} left chat room ${chatId}`);
  });

  // handle incoming messages
  socket.on("chat:message", async (data) => {
    const { chatId, message } = data;
    await chatService.insertMessage(user.id, chatId, message);

    chatNamespace.to(`chat_${chatId}`).emit("chat:message", {
      chatId,
      message,
      sender_id: user.id,
      senderUsername: user.username,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[Chat] ${user.username}:${user.id} sent message to chat room ${chatId}: ${message}`,
    );
  });

  socket.on("disconnect", () => {
    console.log(`[Chat] ${user.username}:${user.id} disconnected from /chat`);
  });
});
