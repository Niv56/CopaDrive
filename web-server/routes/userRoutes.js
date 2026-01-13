const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

// Register a new user
router.post('/', userController.registerUser);

// Get user details by ID
router.get('/:id', userController.getUserById);

// Get user details by email
router.get('/email/:email', userController.getUserByEmail);

// Update user profile
router.patch('/:id', requireAuth, userController.updateUser);

// Change user password
router.patch('/:id/password', requireAuth, userController.changePassword);

module.exports = router;