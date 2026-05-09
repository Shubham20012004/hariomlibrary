// backend/src/routes/authRoutes.js

const express = require('express');
const passport = require('passport');
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// === Standard Email & Password Authentication ===
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// === Password Reset Routes ===
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// === Google OAuth Authentication ===

// @desc    Auth with Google (Initiates the redirect to Google's login page)
// @route   GET /api/auth/google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google auth callback (Google redirects back to this endpoint)
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login.html' }), // Redirect on failure
    (req, res) => {
        // On successful Google authentication, Passport attaches the user to req.user
        const user = req.user;
        const token = user.getSignedJwtToken();

        // Prepare user data to send to a frontend handler page
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        const encodedUser = encodeURIComponent(JSON.stringify(userData));

        // Redirect to a frontend page that can process the token and user data
        res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&user=${encodedUser}`);
    }
);

module.exports = router;
