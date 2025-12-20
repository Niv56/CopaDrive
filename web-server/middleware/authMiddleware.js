/**
 * Authentication Middleware
 * Checks if user is logged in by reading the X-User-Id header
 */
const userRepository = require('../repositories/userRepository');

/**
 * Middleware: Require Authentication
 * Verifies that the request contains a valid X-User-Id header
 * and that the user exists in the system.
 */
const requireAuth = (req, res, next) => {
    try {
        // Read the user ID from the header
        // Supporting both X-User-Id and Authorization formats
        const userId = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');

        // If no header provided, return 401
        if (!userId) {
            const error = new Error("Authentication required");
            error.status = 401;
            throw error;
        }

        // Check if user exists in the system
        const user = userRepository.findById(userId);

        // If user doesn't exist, return 401
        if (!user) {
            const error = new Error("Invalid user ID");
            error.status = 401;
            throw error;
        }

        // Attach user to request object for use in controllers
        req.user = user;

        // Continue to next middleware/controller
        next();

    } catch (err) {
        next(err); // Pass to error handling middleware
    }
};

module.exports = {
    requireAuth
};