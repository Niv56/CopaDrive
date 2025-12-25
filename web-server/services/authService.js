const userRepository = require('../repositories/userRepository');

const verifyCredentials = (email, password) => {
    const user = userRepository.findByEmail(email);

    if (!user) {
        return null;
    }

    if (user.password !== password) {
        return null;
    }

    return user;
};

module.exports = {
    verifyCredentials
};