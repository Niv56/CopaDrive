/**
 * Route definition for User-related endpoints.
 * This file maps incoming HTTP requests to their respective controller functions.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// Maps the registration request to the registerUser function in the controller.
router.post('/users', userController.registerUser);

// Export the router to be used in app.js.
module.exports = router;