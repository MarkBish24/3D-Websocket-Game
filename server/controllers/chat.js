import * as chatService from "../services/chat.js";

export const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatHistory = await chatService.getChatHistory(chatId);
    res.json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

export const insertMessage = async (req, res) => {
  try {
    const { chatId, content, type } = req.body;
    const senderId = req.user.id;
    const message = await chatService.insertMessage(
      senderId,
      chatId,
      content,
      type,
    );
    res.json(message);
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).json({ error: "Failed to insert message" });
  }
};

export const getOrCreatePrivateChat = async (req, res) => {
  try {
    // The Friend they want to talk to is in the UTL, and their own ID is inside the auth token
    const friendId = req.params.friendId;
    const userId = req.user.id;

    const chatId = await chatService.getOrCreatePrivateChat(userId, friendId);
    res.json({ chatId });
  } catch (error) {
    console.error("Error getting or creating private chat:", error);
    res.status(500).json({ error: "Failed to get or create private chat" });
  }
};
