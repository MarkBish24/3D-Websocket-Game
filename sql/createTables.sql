CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) DEFAULT 'google',
  provider_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  picture TEXT,
  bio TEXT,
  last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  setup_complete BOOLEAN DEFAULT FALSE,
  public BOOLEAN DEFAULT TRUE
);

--------------------------------------
-------- FRIENDSHIP SYSTEM -----------
--------------------------------------

CREATE TABLE IF NOT EXISTS friendships (
	id SERIAL PRIMARY KEY,
	requester_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	addressee_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	status VARCHAR(20) NOT NULL DEFAULT 'pending',
	blocked_by INT REFERENCES players(id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
	CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS friendship_events(
	id SERIAL PRIMARY KEY,
	friendship_id INT NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
	actor_id INT NOT NULL REFERENCES players(id), -- who triggered this evenet
	event VARCHAR(20) NOT NULL, -- 'requested', 'accepted', 'declined', 'blocked'
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------
-------- CHAT SYSTEM -----------------
--------------------------------------

CREATE TABLE IF NOT EXISTS chats (
	id SERIAL PRIMARY KEY,
	type VARCHAR(20) NOT NULL, -- 'private' or 'group'
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_participants (
	id SERIAL PRIMARY KEY,
	chat_id INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
	player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	
	UNIQUE(chat_id, player_id)
);

CREATE TABLE IF NOT EXISTS messages (
	id SERIAL PRIMARY KEY,
	type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
	chat_id INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
	sender_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

