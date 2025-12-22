const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');

const registerUser = (userData) => {
    // Conflict Check: Username
    if (userRepository.findByUsername(userData.username)) {
        const error = new Error("Username already taken");
        error.status = 409;
        throw error;
    }

    // Conflict Check: Email
    if (userRepository.findByEmail(userData.email)) {
        const error = new Error("Email already registered");
        error.status = 409;
        throw error;
    }

    // Enrich Data: Generate ID and ISO Timestamp
    const newUser = {
        id: generateId((id) => userRepository.findById(id)),
        ...userData,
        lastLogin: new Date().toISOString() // Using ISO for consistency with Files API
    };

    userRepository.create(newUser);
    const safeResponse = { ...newUser };
    delete safeResponse.password;

    return safeResponse;
};

const getSafeUserById = (userId) => {
    const user = userRepository.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    // Remove password before returning to controller
    const userDto = { ...user };
    delete userDto.password;
    return userDto;
};

module.exports = {
    registerUser,
    getSafeUserById
};