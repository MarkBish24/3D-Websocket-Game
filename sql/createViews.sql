CREATE OR REPLACE VIEW v_chat_messages AS
SELECT
    m.id,
    m.type,
    m.chat_id,
    m.sender_id,
    p.username AS sender_username,
    p.picture AS sender_picture,
    m.content,
    m.sent_at
FROM messages m
JOIN players p ON m.sender_id = p.id;

CREATE OR REPLACE VIEW v_player_chats AS
SELECT
    cp.player_id,
    c.id AS chat_id,
    c.type AS chat_type,
    cp.joined_at
FROM chat_participants cp
JOIN chats c ON cp.chat_id = c.id;