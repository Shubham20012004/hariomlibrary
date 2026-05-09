// backend/src/utils/generateReceiptId.js

/**
 * Generates a unique receipt ID.
 * This is a simple example; for production, consider more robust ID generation
 * that might involve timestamps, random strings, and sequence numbers
 * to guarantee uniqueness and prevent collisions, especially in a high-volume system.
 *
 * @returns {string} A unique receipt ID.
 */
const generateReceiptId = () => {
    const timestamp = Date.now().toString(36); // Base 36 timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
    return `REC-${timestamp}-${randomString}`.toUpperCase(); // Combine and format
};

module.exports = generateReceiptId;
