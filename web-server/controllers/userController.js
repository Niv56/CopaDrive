const userService = require('../services/userService');
const {
    validateFields,
    validateNonEmptyString,
    validateDateOfBirth,
    validateGender
} = require('../utils/validation');

// Registers a new user with required field validation
exports.registerUser = async (req, res, next) => {
    try {
        const required = ['firstName', 'email', 'phoneNumber', 'password', 'dateOfBirth', 'gender'];
        validateFields(req.body, required);

        // If profilePicture is provided, validate it's a string
        if (req.body.profilePicture) {
            validateNonEmptyString(req.body, 'profilePicture', 'profilePicture must be a non-empty string');
        }

        validateDateOfBirth(req.body, 'dateOfBirth');
        validateGender(req.body, 'gender');
        
        const newUser = await userService.registerUser(req.body);
        return res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
};

// Return a user object by ID
exports.getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Wait for MongoDB to find the user by their custom ID
        const user = await userService.getById(userId);
        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// Retrieves public user details by email
exports.getUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.params;
        
        // Asynchronous lookup in the users collection
        const user = await userService.getByEmail(email);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Return only public details
        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image
        });
    } catch (err) { 
        next(err); 
    }
};

// Updates user profile information (restricted to self)
exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Security check: ensure the authenticated user is updating their own profile
        if (!req.user || String(req.user.id) !== String(userId)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const allowed = ['firstName', 'lastName', 'phoneNumber', 'image', 'profilePicture'];
        const patch = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) patch[k] = req.body[k];
        }

        // Normalize image key
        if (patch.profilePicture && !patch.image) {
            patch.image = patch.profilePicture;
            delete patch.profilePicture;
        }

        /**
         * Perform the update in MongoDB and wait for the result.
         * The service now returns a Promise.
         */
        const updated = await userService.updateUserProfile(userId, patch);
        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// Changes the user's password (restricted to self)
exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!req.user || String(req.user.id) !== String(userId)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "currentPassword and newPassword are required" });
        }

        // Must await the database password update
        await userService.changePassword(userId, currentPassword, newPassword);
        return res.status(200).json({ message: "Password updated" });
    } catch (err) {
        next(err);
    }
};