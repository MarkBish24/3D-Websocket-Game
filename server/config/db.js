import knex from "knex";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 2, max: 10 },
});

const connectDB = async (app) => {
  try {
    await db.raw("SELECT 1");
    app.locals.db = db; // Assign knex to app.locals.db
    console.log("PostgreSQL (Knex) connected.");
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

export { connectDB, db };
