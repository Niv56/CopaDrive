const { users } = require('../utils/storage'); // Accessing the initialized store

// Find a user by their unique ID
const findById = (id) => users.find(u => u.id === id);

// Find user by email
const findByEmail = (email) => users.find(u => u.email === email);

// Add a new user entity to the memory store
const create = (userData) => {
  users.push(userData);
  return userData;
};

// ✅ NEW: Update existing user in the in-memory store
const update = (id, patch) => {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...patch };
  return users[idx];
};

module.exports = {
  findById,
  findByEmail,
  create,
  update
};
