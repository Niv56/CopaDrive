const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

/**
 * Handle user login
 * POST /api/tokens
 */
exports.login = (req, res, next) => {
    try {
        // Ensure username and password are provided
        const required = ['username', 'password'];
        validateFields(req.body, required);

        const { username, password } = req.body;

        // Verify credentials using the auth service
        const user = authService.verifyCredentials(username, password);

        // If credentials are invalid
        if (!user) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        res.status(200).json({
            userId: user.id
        });

    } catch (err) {
        next(err);
    }
};