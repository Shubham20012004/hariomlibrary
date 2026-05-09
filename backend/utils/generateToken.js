// backend/src/utils/generateToken.js

const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) for a given user ID and role.
 * @param {string} id - The user's MongoDB ObjectId.
 * @param {string} role - The user's role ('student' or 'admin').
 * @returns {string} The signed JWT.
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

module.exports = generateToken;
