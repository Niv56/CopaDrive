const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');

const registerUser = (userData) => {
    // Conflict Check: Email
    if (userRepository.findByEmail(userData.email)) {
        const error = new Error("Email already registered");
        error.status = 409;
        throw error;
    }

    // Enrich Data: Generate ID and ISO Timestamp
    const newUser = {
        id: generateId((id) => userRepository.findById(id)),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        image: userData.image,
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

const getByEmail = (email) => {
    return userRepository.findByEmail(email);
};

module.exports = {
    registerUser,
    getSafeUserById,
    getByEmail
};