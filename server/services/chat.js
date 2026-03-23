import { db } from "../config/db.js";

//get the past chat history
export const getChatHistory = async (chatId, limit = 50) => {
  return await db("v_chat_messages")
    .where({ chat_id: chatId })
    .orderBy("sent_at", "asc")
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

export const getOrCreatePrivateChat = async (userId1, userId2) => {
  const existingChat = await db("v_player_chats as p1")
    .join("v_player_chats as p2", "p1.chat_id", "p2.chat_id")
    .where({
      "p1.player_id": userId1,
      "p2.player_id": userId2,
      "p1.chat_type": "private",
    })
    .first();

  if (existingChat) {
    return existingChat.chat_id;
  }

  // create new chat
  const [newChat] = await db("chats")
    .insert({ type: "private" })
    .returning("id");

  await db("chat_participants").insert([
    { chat_id: newChat.id, player_id: userId1 },
    { chat_id: newChat.id, player_id: userId2 },
  ]);

  return newChat.id;
};
