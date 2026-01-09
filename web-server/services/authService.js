const userRepository = require('../repositories/userRepository');

/**
 * Get user by email
 */
exports.getUserByEmail = (email) => {
    return userRepository.findByEmail(email);
};

/**
 * Verify user credentials
 */
exports.verifyCredentials = (email, password) => {
    const user = userRepository.findByEmail(email);

    if (!user) {
        return null;
    }

    // In production, use bcrypt.compare(password, user.password)
    if (user.password !== password) {
        return null;
    }

    return user;
};