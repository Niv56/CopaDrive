const User = require('../models/user');
const mongoose = require('mongoose');

async function create(data) {
    const user = new User(data);
    return await user.save();
}

async function findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findById(id);
}

async function findByEmail(email) {
    return await User.findOne({ email });
}

async function update(id, patch) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findByIdAndUpdate(id, patch, { new: true });
}

module.exports = {
    create,
    findById,
    findByEmail,
    update
};