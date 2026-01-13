const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes under /api/tokens
router.post('/', authController.login);

module.exports = router;
