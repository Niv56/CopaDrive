/**
 * Implement Users Repository Methods.
 * This layer abstracts the direct manipulation of the in-memory users array.
 */
const { users } = require('../services/userService'); // Accessing the initialized store

// Find a user by their unique ID
const findById = (id) => users.find(u => u.id === id);

// Find a user by username to support uniqueness checks during registration
const findByUsername = (username) => users.find(u => u.username === username);

// Find user by email
const findByEmail = (email) => users.find(u => u.email === email);

// Find user by password (as requested for uniqueness check)
const findByPassword = (password) => users.find(u => u.password === password);

// Add a new user entity to the memory store
const create = (userData) => {
    users.push(userData);
    return userData;
};

module.exports = {
    findById,
    findByUsername,
    findByEmail, 
    findByPassword,
    create
};