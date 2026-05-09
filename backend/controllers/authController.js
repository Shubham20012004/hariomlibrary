// backend/src/controllers/authController.js

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || password.trim().length === 0) {
        res.status(400);
        throw new Error('Please enter all fields: name, email, and a non-empty password.');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with that email.');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
    });

    // Send back a clean user object and a token
    sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter both email and password.');
    }

    // Check for user by email and explicitly select the password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
});

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware
    // The user object is already available, no need to query again
    res.status(200).json(req.user);
});


// @desc    Forgot Password - Step 1: Request a reset token
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    // For security, always send a generic success message
    if (!user) {
        return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Get the unhashed reset token from the user model method
    const resetToken = user.getPasswordResetToken();

    // Save the user model to store the hashed token and expiry date
    await user.save({ validateBeforeSave: false });

    // This URL should point to your FRONTEND application's reset password page
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested to reset your password. Please click the link below to complete the process:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
        });

        res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });

    } catch (err) {
        console.error('Error sending password reset email:', err);
        // Clear the token fields if email fails to send
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new Error('Email could not be sent. Please try again later.');
    }
});


// @desc    Reset Password - Step 2: Set the new password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    // Hash the token from the URL to match the one in the database
    const passwordResetToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    // Find user by the hashed token and check if it has not expired
    const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token.');
    }

    // Set the new password and clear the reset fields
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // The pre-save hook in the User model will hash the new password
    await user.save();

    // Log the user in by sending a new token for a seamless experience
    sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
});


// Helper function to create a clean user object and send a token in the response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.getSignedJwtToken();

    // Create a clean user object to send back, excluding sensitive info
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        fees: user.fees, // Include fees if needed
    };

    res.status(statusCode).json({
        message,
        user: userResponse,
        token,
    });
};
