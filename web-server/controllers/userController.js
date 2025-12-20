/**
 * User Controller
 * Routes incoming HTTP requests to the appropriate service logic.
 */
const userService = require('../services/userService');
const { validateFields } = require('../utils/validation');

/**
 * POST /api/users
 * Handles user registration request.
 */
exports.registerUser = (req, res, next) => {
    try {
        // Validate that all required fields exist in request body
        const required = ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'password'];
        validateFields(req.body, required);

        // Delegate logic to the service layer
        const newUser = userService.registerUser(req.body);

        // Prepare response (Service already cleaned the password)
        res.status(201).json(newUser);

    } catch (err) {
        next(err); // Forward errors to Global Error Handler
    }
};

/**
 * GET /api/users/:id
 * Fetches a specific user profile by ID.
 */
exports.getUserById = (req, res, next) => {
    try {
        const userId = req.params.id;

        // Fetch the safe user profile from service
        const user = userService.getSafeUserById(userId);

        // Respond with 200 OK
        res.status(200).json(user);

    } catch (err) {
        next(err);
    }
};