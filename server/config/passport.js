import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import process from "process";
import { db } from "./db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db("players")
          .where({ provider_id: profile.id })
          .first();

        if (user) {
          return done(null, user);
        }
        //create a random username with numbers to guarantee uniqueness on creation
        const tempUsername = `${profile.displayName}${Math.floor(Math.random() * 100000)}`;

        const [newUser] = await db("players")
          .insert({
            provider_id: profile.id,
            email: profile.emails[0].value,
            username: tempUsername,
            picture: profile.photos[0].value,
            setup_complete: false,
          })
          .returning("*");

        return done(null, newUser);
      } catch (error) {
        console.error("Error in GoogleStrategy callback:", error);
        return done(error, false);
      }
    },
  ),
);

export default passport;
