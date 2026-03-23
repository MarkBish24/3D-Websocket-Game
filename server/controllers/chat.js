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
