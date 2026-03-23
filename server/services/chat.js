import { db } from "../config/db.js";

//get the past chat history
export const getChatHistory = async (chatId, limit = 50) => {
  return await db("v_chat_messages")
    .where({ chat_id: chatId })
    .orderBy("sent_at", "desc")
    .limit(limit);
};

//insert a new message
export const insertMessage = async (
  senderId,
  chatId,
  content,
  type = "text",
) => {
  return await db("messages")
    .insert({
      sender_id: senderId,
      chat_id: chatId,
      content: content,
      type: type,
    })
    .returning("*");
};
