const File = require('../models/file');
const mongoose = require('mongoose');

/**
 * Creates a new file/folder document
 */
async function create(data) {
    
    const file = new File(data);
    const saved = await file.save(); 
    return saved;
}

/**
 * Finds a file by ID
 */
async function findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await File.findById(id);
}

/**
 * Updates a file document
 */
async function update(id, patch) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await File.findByIdAndUpdate(id, patch, { new: true });
}

/**
 * Deletes a file permanently
 */
async function deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await File.findByIdAndDelete(id);
}

/**
 * Lists all owned items for a user (any parent) to allow client-side folder filtering
 */
async function findTopLevel(userId) {
    
    const allFiles = await File.find({}).limit(10);
    allFiles.forEach(f => {
        console.log(`  - File: ${f.name}, ownerId: ${f.ownerId} (type: ${typeof f.ownerId}), parentId: ${f.parentId}, trashed: ${f.trashed}`);
    });
    
    const results = await File.find({
        $or: [
            { ownerId: userId, trashed: false },
            { starredBy: userId, trashed: false },
            { importantBy: userId, trashed: false }
        ]
    }).sort({ createdAt: -1 });
    
    
    return results;
}

/**
 * Lists all children of a folder
 */
async function findChildren(parentId) {
    return await File.find({ parentId, trashed: false });
}

/**
 * Search files by name or content
 */
async function search(userId, query) {
    const regex = new RegExp(query, 'i');
    return await File.find({
        $or: [
            { ownerId: userId, name: regex, trashed: false },
            { starredBy: userId, name: regex, trashed: false }
        ]
    });
}

/**
 * Lists starred items for a user
 */
async function findStarred(userId) {
    return await File.find({
        starredBy: userId,
        trashed: false
    }).sort({ updatedAt: -1 });
}

/**
 * Lists important items for a user
 */
async function findImportant(userId) {
    return await File.find({
        importantBy: userId,
        trashed: false
    }).sort({ updatedAt: -1 });
}

/**
 * Lists trashed items for a user
 */
async function findTrashed(userId) {
    return await File.find({
        trashedBy: userId,
        trashed: true
    }).sort({ ['trashedAtBy.' + userId]: -1 });
}

/**
 * Lists recently accessed items
 */
async function findRecent(userId, limit = 20) {
    const files = await File.find({
        [`lastAccessedBy.${userId}`]: { $exists: true },
        trashed: false
    }).sort({ [`lastAccessedBy.${userId}`]: -1 }).limit(limit);
    
    return files;
}

/**
 * Calculates total storage used by owned files
 */
async function calculateOwnedStorage(userId) {
    const result = await File.aggregate([
        { $match: { ownerId: new mongoose.Types.ObjectId(userId), type: 'file', trashed: false } },
        { $group: { _id: null, total: { $sum: '$sizeBytes' } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
}

/**
 * Bulk delete operation
 */
async function deleteMany(filter) {
    return await File.deleteMany(filter);
}

module.exports = {
    create,
    findById,
    update,
    deleteById,
    findTopLevel,
    findChildren,
    search,
    findStarred,
    findImportant,
    findTrashed,
    findRecent,
    calculateOwnedStorage,
    deleteMany
};