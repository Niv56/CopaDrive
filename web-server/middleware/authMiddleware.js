const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userRepository = require('../repositories/userRepository');

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

    const payload = jwt.verify(token, secret);
    const userId = payload?.userId;
    

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid token payload");
      error.status = 401;
      throw error;
    }

    const user = await userRepository.findById(userId);
    
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