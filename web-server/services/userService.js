const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');

// Register a new user and return a safe (password-free) response.
const registerUser = (userData) => {
  if (userRepository.findByEmail(userData.email)) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const newUser = {
    id: generateId((id) => userRepository.findById(id)),
    firstName: userData.firstName,
    lastName: userData.lastName || '',
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    password: userData.password,
    image: userData.profilePicture || userData.image || '',
    dateOfBirth: userData.dateOfBirth,
    gender: userData.gender,
    lastLogin: new Date().toISOString()
  };

  userRepository.create(newUser);

  const safeResponse = { ...newUser };
  delete safeResponse.password;
  return safeResponse;
};

// Get a user by id and return a safe (password-free) DTO.
const getSafeUserById = (userId) => {
  const user = userRepository.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const userDto = { ...user };
  delete userDto.password;
  return userDto;
};

// Get a user by email (raw repository result).
const getByEmail = (email) => {
  return userRepository.findByEmail(email);
};

// Update allowed profile fields for the given user and return a safe user object.
const updateUserProfile = (userId, patch) => {
  const user = userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const cleanPatch = {};

  if (patch.firstName !== undefined) cleanPatch.firstName = String(patch.firstName).trim();
  if (patch.lastName !== undefined) cleanPatch.lastName = String(patch.lastName).trim();
  if (patch.phoneNumber !== undefined) cleanPatch.phoneNumber = String(patch.phoneNumber).trim();
  if (patch.image !== undefined) cleanPatch.image = String(patch.image);

  const updated = userRepository.update(userId, cleanPatch);
  if (!updated) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const safe = { ...updated };
  delete safe.password;
  return safe;
};

// Change the user's password after validating current and new passwords.
const changePassword = (userId, currentPassword, newPassword) => {
  const user = userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    const error = new Error("Current password is required");
    error.status = 400;
    throw error;
  }

  if (typeof newPassword !== 'string' || newPassword.length === 0) {
    const error = new Error("New password is required");
    error.status = 400;
    throw error;
  }

  if (String(user.password) !== String(currentPassword)) {
    const error = new Error("Current password is incorrect");
    error.status = 400;
    throw error;
  }

  if (String(newPassword) === String(currentPassword)) {
    const error = new Error("New password cannot be the same as current password");
    error.status = 400;
    throw error;
  }

  const updated = userRepository.update(userId, { password: String(newPassword) });
  if (!updated) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return true;
};

module.exports = {
  registerUser,
  getSafeUserById,
  getByEmail,
  updateUserProfile,
  changePassword
};
