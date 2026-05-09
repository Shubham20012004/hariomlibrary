// backend/src/config/passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Assuming your User model is here
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                // This function is called when Google successfully authenticates a user
                // 'profile' contains the user's Google profile information
                // 'done' is a callback to tell Passport what to do next

                const newUser = {
                    googleId: profile.id, // Store Google's unique ID for the user
                    name: profile.displayName,
                    email: profile.emails[0].value, // Get the primary email
                    // You might want to set a default role for new Google sign-ups, e.g., 'student'
                    role: 'student', // Default role for new users signing up via Google
                };

                try {
                    // Check if the user already exists in your database based on googleId
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // If user exists, pass them to Passport
                        done(null, user);
                    } else {
                        // If user does not exist, create a new user in your database
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null); // Pass error to Passport
                }
            }
        )
    );

    // Serialize user: Passport saves the user ID to the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user: Passport retrieves the user from the database using the ID from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    });
};
