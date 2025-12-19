// Import the new infrastructure components [cite: 104, 105]
const userRepository = require('../repositories/userRepository');
const { validateFields } = require('../utils/validation');
const { generateId } = require('../utils/idGenerator');

// This controller handles the business logic for user registration.
exports.registerUser = (req, res, next) => {
    try {
        // Validation: Ensure the client sent the 'username' field
        const required = ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'password'];
        validateFields(req.body, required);

        // Conflict Checks (Uniqueness Enforcement)
        // Check Username
        if (userRepository.findByUsername(req.body.username)) {
            const error = new Error("Username already taken");
            error.status = 409;
            throw error;
        }

        // Check Email
        if (userRepository.findByEmail(req.body.email)) {
            const error = new Error("Email already registered");
            error.status = 409;
            throw error;
        }

        // Check Password
        if (userRepository.findByPassword(req.body.password)) {
            const error = new Error("Password must be unique among users");
            error.status = 409;
            throw error;
        }

        // Automated Data Generation: Server creates timestamps and ID's
        const now = new Date().toLocaleString('he-IL');
        
        // Entity Definition: The 'shape' of the User object in this system
        const newUser = {
            id: generateId(),               // Unique ID generated on the server
            ...req.body,                    // Spreads firstName, lastName, username, email, phoneNumber, password
            lastLogin: now                  // "Connected at this time" (initial login)
        };

        // Persistence: Save to the in-memory array via repository
        userRepository.create(newUser);

        // Safe Response (Removing password)
        // We create a copy of the object and delete the password field before sending.
        const userResponse = { ...newUser };
        delete userResponse.password;

        // If registration is successful, return a 201 Created status with a JSON response.
        res.status(201).json(userResponse);

    } catch (err) {
        // Ensures the Centralized Error Handler formats the response as JSON.
        next(err);
    }
};