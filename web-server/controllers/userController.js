const userService = require('../services/userService');
const { validateFields, validateNonEmptyString } = require('../utils/validation');

/**
 * POST /api/users
 * Handles user registration request.
 */
exports.registerUser = (req, res, next) => {
  try {
    const required = ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'password', 'image'];
    validateFields(req.body, required);

    validateNonEmptyString(req.body, 'image', 'image must be a non-empty string');

    const newUser = userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
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

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
