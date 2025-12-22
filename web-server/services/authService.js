const userRepository = require('../repositories/userRepository');

const verifyCredentials = (username, password) => {
    const user = userRepository.findByUsername(username);

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