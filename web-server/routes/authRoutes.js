/**
 * Route definition for Authentication endpoints.
 * Maps incoming HTTP requests to auth controller functions.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/tokens - User login endpoint
router.post('/', authController.login);

module.exports = router;