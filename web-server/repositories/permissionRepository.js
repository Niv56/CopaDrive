const Permission = require('../models/permission');
const mongoose = require('mongoose');

/**
 * Creates a new permission
 */
async function create(data) {
    const perm = new Permission(data);
    return await perm.save();
}

/**
 * Finds permission by ID
 */
async function findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Permission.findById(id);
}

/**
 * Finds permission by user and file
 */
async function findByUserAndFile(userId, fileId) {
    return await Permission.findOne({ userId, fileId });
}

/**
 * Lists all permissions for a file
 */
async function findByFile(fileId) {
    return await Permission.find({ fileId }).populate('userId', 'firstName lastName email image');
}

/**
 * Lists all files shared with a user
 */
async function findSharedFiles(userId) {
    return await Permission.find({ userId });
}

/**
 * Updates a permission
 */
async function update(id, patch) {
    return await Permission.findByIdAndUpdate(id, patch, { new: true });
}

/**
 * Deletes a permission
 */
async function deleteById(id) {
    return await Permission.findByIdAndDelete(id);
}

/**
 * Deletes all permissions for a file
 */
async function deleteByFile(fileId) {
    return await Permission.deleteMany({ fileId });
}

module.exports = {
    create,
    findById,
    findByUserAndFile,
    findByFile,
    findSharedFiles,
    update,
    deleteById,
    deleteByFile
};