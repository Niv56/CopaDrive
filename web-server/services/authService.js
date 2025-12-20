/**
 * Authentication Service
 * Handles login verification logic
 */
const userRepository = require('../repositories/userRepository');

/**
 * Verify user credentials
 * @param {string} username - The username to check
 * @param {string} password - The password to verify
 * @returns {Object|null} - Returns user object if valid, null if invalid
 */
const verifyCredentials = (username, password) => {
    // Find user by username
    const user = userRepository.findByUsername(username);
    
    // If user doesn't exist, return null
    if (!user) {
        return null;
    }
    
    // Check if password matches
    // Note: In production, you'd compare hashed passwords
    if (user.password !== password) {
        return null;
    }
    
    // Credentials are valid, return the user
    return user;
};

module.exports = {
    verifyCredentials
};