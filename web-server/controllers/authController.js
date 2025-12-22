/**
 * Authentication Controller
 * Handles HTTP requests related to login/authentication
 */
const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

/**
 * Handle user login
 * POST /api/tokens
 */
exports.login = (req, res, next) => {
    try {
        // Validation: Ensure username and password are provided
        const required = ['username', 'password'];
        validateFields(req.body, required);

        const { username, password } = req.body;

        // Verify credentials using the auth service
        const user = authService.verifyCredentials(username, password);

        // If credentials are invalid, return 401 Unauthorized
        if (!user) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        // Success: Return user ID
        res.status(200).json({
            userId: user.id
        });

    } catch (err) {
        next(err); // Pass to error handling middleware
    }
};