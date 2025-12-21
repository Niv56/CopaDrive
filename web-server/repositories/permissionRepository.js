
// Handle in - memory data operation for file / folder permissions
const { permissions } = require('../utils/storage');

// Find all associated with a specific file
const findByFileId = (fileId) => permissions.filter(p => p.fileId === fileId);

// Find a specific permission entry by ID
const findById = (id) => permissions.find(p => p.id === id);

// Add new permission to the file / folder
const create = (permissionData) => {
    permissions.push(permissionData);
    return permissionData;
};


// Upadate permission to file / folder
const update = (id, updates) => {
    const idx = permissions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    permissions[idx] = { ...permissions[idx], ...updates };
    return permissions[idx];
};

// Remove permission from file / folder
const remove = (id) => {
    const idx = permissions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    return permissions.splice(idx, 1)[0];
};

const findByUserId = (userId) => permissions.filter(p => p.userId === userId);

module.exports = { findByFileId, findById, create, update, remove, findByUserId};