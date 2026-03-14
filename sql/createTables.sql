CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) DEFAULT 'google',
  provider_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
)