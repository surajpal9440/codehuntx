// client id:- 925458247998-nor3344s8rrt8hq9al8p33c3c3jncr6i.apps.googleusercontent.com

// client secret :-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
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Always look for the user by email first to prevent duplicates
      const userEmail = profile.emails[0].value;
      let user = await User.findOne({ emailId: userEmail }); // Using emailId to match your schema

      if (user) {
        // If user exists, link googleId if it's missing
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // 2. 🚀 THE FIX: Mapping Google profile to your Schema fields
      const newUser = await User.create({
        googleId: profile.id,
        // Match 'firstName' in your schema
        firstName: profile.name.givenName || profile.displayName, 
        // Match 'emailId' in your schema
        emailId: userEmail, 
        // Match 'password' - Google users don't have one, but your schema requires it.
        // We provide a random hashed-like string to satisfy Mongoose requirements.
        password: "google_auth_" + Math.random().toString(36).slice(-8),
        lastName: profile.name.familyName || ""
      });

      return done(null, newUser);
    } catch (err) {
      console.error("❌ Google Auth DB Error:", err);
      return done(err, null);
    }
  }
));