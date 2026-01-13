const userRepository = require('../repositories/userRepository');

// Retrieves a user by their email address
exports.getUserByEmail = (email) => {
    return userRepository.findByEmail(email);
};

// Verifies user credentials by checking email and password
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