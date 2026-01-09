const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

exports.login = (req, res, next) => {
  try {
    validateFields(req.body, ['email', 'password']);

    const { email, password } = req.body;

    // Step 1: Check if user exists
    const userExists = authService.getUserByEmail(email);
    if (!userExists) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    // Step 2: Verify password
    const user = authService.verifyCredentials(email, password);
    if (!user) {
      const error = new Error("Incorrect password");
      error.status = 401;
      throw error;
    }

    // Step 3: Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });

  } catch (err) {
    next(err);
  }
};