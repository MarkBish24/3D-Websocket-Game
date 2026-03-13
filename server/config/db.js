import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const connectDB = async (app) => {
  try {
    await pool.query("SELECT 1"); // test connection
    app.locals.db = pool;
    console.log("PostgreSQL connected.");
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};
export { connectDB, pool };
