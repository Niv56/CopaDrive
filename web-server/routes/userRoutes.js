const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Both routes start with /api/users
router.post('/', userController.registerUser);

router.get('/:id', userController.getUserById);

module.exports = router;