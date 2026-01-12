const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');


// Both routes start with /api/users
router.post('/', userController.registerUser);

router.get('/:id', userController.getUserById);

router.get('/email/:email', userController.getUserByEmail);

// ✅ NEW: Update profile (self only)
router.patch('/:id', requireAuth, userController.updateUser);

// ✅ NEW: Change password (self only)
router.patch('/:id/password', requireAuth, userController.changePassword);

module.exports = router;