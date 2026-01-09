const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

exports.login = (req, res, next) => {
  try {
    validateFields(req.body, ['email', 'password']);

    const { email, password } = req.body;

    const user = authService.verifyCredentials(email, password);
    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

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
