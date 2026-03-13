import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import process from "process";
import { pool } from "./db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await pool.query(
          "SELECT * FROM players WHERE provider_id = $1",
          [profile.id],
        );
        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }
        const newUser = await pool.query(
          "INSERT INTO players (provider_id, email, username, picture) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            profile.id,
            profile.emails[0].value,
            profile.displayName,
            profile.photos[0].value,
          ],
        );
        return done(null, newUser.rows[0]);
      } catch (error) {
        console.error("Error in GoogleStrategy callback:", error);
        return done(error, false);
      }
    },
  ),
);

export default passport;
