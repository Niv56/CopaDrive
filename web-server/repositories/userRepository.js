const { users } = require('../utils/storage');// Accessing the initialized store

// Find a user by their unique ID
const findById = (id) => users.find(u => u.id === id);

// Find user by email
const findByEmail = (email) => users.find(u => u.email === email);

// Add a new user entity to the memory store
const create = (userData) => {
    users.push(userData);
    return userData;
};

module.exports = {
    findById,
    findByEmail, 
    create
};