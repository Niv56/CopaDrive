const userRepository = require('../repositories/userRepository');

/**
 * Register a new user and return a response without password.
 * Uses custom generated ID instead of MongoDB's default _id.
 */
const registerUser = async (userData) => {
  // Check if the email already exists in the database
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const newUser = {
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

  // Persist the new user to MongoDB using the repository
  const savedUser = await userRepository.create(newUser);

  // Convert the Mongoose document to a plain object to safely delete the password field
  const safeResponse = savedUser.toObject ? savedUser.toObject() : { ...savedUser };
  delete safeResponse.password;
  
  return safeResponse;
};

/**
 * Get a user by their custom generated ID.
 */
const getById = async (userId) => {
  // Search specifically by the custom 'id' field
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const userDto = user.toObject ? user.toObject() : { ...user };
  delete userDto.password;
  return userDto;
};

/**
 * Return user data by email.
 */
const getByEmail = async (email) => {
  return await userRepository.findByEmail(email);
};

/**
 * Update profile fields using ID.
 */
const updateUserProfile = async (userId, patch) => {
  // Verify user existence before attempting update
  const user = await userRepository.findById(userId);
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

  // Perform the update in MongoDB via the repository
  const updated = await userRepository.update(userId, cleanPatch);
  if (!updated) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const safe = updated.toObject ? updated.toObject() : { ...updated };
  delete safe.password;
  return safe;
};

/**
 * Validate current password and update to a new one.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  // Fetch user from DB using ID
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Verification logic for the password fields
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

  // Update the password in the database
  await userRepository.update(userId, { password: String(newPassword) });
  return true;
};

module.exports = {
  registerUser,
  getById,
  getByEmail,
  updateUserProfile,
  changePassword
};