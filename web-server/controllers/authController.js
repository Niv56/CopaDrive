const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const { validateFields } = require('../utils/validation');

// Authenticates user credentials and issues a JWT
exports.login = async (req, res, next) => { 
  try {
    validateFields(req.body, ['email', 'password']);

    const { email, password } = req.body;

    
    const userExists = await authService.getUserByEmail(email);
    if (!userExists) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const user = await authService.verifyCredentials(email, password);
    if (!user) {
      const error = new Error("Incorrect password");
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
      { userId: user._id.toString() },
      secret,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};