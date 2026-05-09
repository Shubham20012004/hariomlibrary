// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corrected path
const asyncHandler = require('./asyncHandler'); // Corrected path

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            // IMPORTANT: Ensure the user's role is trimmed immediately after being set on req.user
            // This prevents issues with newline characters or other whitespace
            if (req.user && req.user.role) {
                req.user.role = String(req.user.role).trim();
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // IMPORTANT: Trim the req.user.role here as well, to ensure consistent comparison
        // In case the .trim() in protect middleware was missed or overridden by subsequent middleware
        const userRole = req.user && req.user.role ? String(req.user.role).trim() : null;

        if (!userRole || !roles.includes(userRole)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};
