// controllers/players.js

export const getPlayers = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.query("SELECT * FROM players");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlayer = async (req, res) => {
  const db = req.app.locals.db;
  const { username } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO players (username) VALUES ($1) RETURNING *",
      [username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
