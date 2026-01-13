const { users } = require('../utils/storage');

// Find a user by their unique ID
const findById = (id) => users.find(u => u.id === id);

// Find a user by email
const findByEmail = (email) => users.find(u => u.email === email);

// Create a new user
const create = (userData) => {
  users.push(userData);
  return userData;
};

// Update an existing user
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