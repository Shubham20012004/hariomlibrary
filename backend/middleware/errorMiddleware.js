// backend/src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code based on the error
    // If a specific status code was set by a previous error (e.g., res.status(400)), use it.
    // Otherwise, default to 500 (Internal Server Error).
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    // Send a JSON response with the error message and stack trace (only in development)
    res.json({
        message: err.message,
        // Stack trace is useful for debugging in development, but should not be exposed in production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
