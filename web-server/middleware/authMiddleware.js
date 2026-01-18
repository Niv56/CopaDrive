const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

/**
 * Validate JWT from Authorization header and attach the user to req.user.
 */
const requireAuth = async (req, res, next) => { 
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }

    const token = authHeader.substring('Bearer '.length).trim();
    if (!token) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    // Verify the token and extract payload
    const payload = jwt.verify(token, secret);

    const userId = payload?.userId;
    if (!userId) {
      const error = new Error("Invalid token");
      error.status = 401;
      throw error;
    }

    
    const user = await userRepository.findById(payload.userId);
    
    if (!user) {
      const error = new Error("Invalid token user");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err.status = 401;
      err.message = "Invalid or expired token";
    }
    next(err);
  }
};

module.exports = { requireAuth };