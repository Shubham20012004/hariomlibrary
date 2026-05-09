// backend/src/server.js

const dotenv = require('dotenv');
// This MUST be the first line to ensure all environment variables are loaded before any other file needs them.
dotenv.config();

const express = require('express');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

// Load Passport config - this line can now safely access the environment variables
require('./config/passport')(passport);

// Import your routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to the database
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Session Middleware (MUST COME BEFORE PASSPORT MIDDLEWARE)
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Make sure SESSION_SECRET is in your .env file
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
    })
);

// Passport middleware (MUST COME AFTER SESSION MIDDLEWARE)
app.use(passport.initialize());
app.use(passport.session());

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Error handler middleware (should be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
