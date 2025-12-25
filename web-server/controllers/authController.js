const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

/**
 * Handle user login
 * POST /api/tokens
 */
exports.login = (req, res, next) => {
    try {
        // Ensure email and password are provided
        const required = ['email', 'password'];
        validateFields(req.body, required);

        const { email, password } = req.body;

        // Verify credentials using the auth service
        const user = authService.verifyCredentials(email, password);

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