const { permissions } = require('../utils/storage');

// Find all permissions for a given file/folder id.
const findByFileId = (fileId) => permissions.filter(p => p.fileId === fileId);

// Find a permission entry by its id.
const findById = (id) => permissions.find(p => p.id === id);

// Create a new permission entry.
const create = (permissionData) => {
    permissions.push(permissionData);
    return permissionData;
};

// Update an existing permission entry.
const update = (id, updates) => {
    const idx = permissions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    permissions[idx] = { ...permissions[idx], ...updates };
    return permissions[idx];
};

// Remove a permission entry by id.
const remove = (id) => {
    const idx = permissions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    return permissions.splice(idx, 1)[0];
};

// Find all permissions for a given user id.
const findByUserId = (userId) => permissions.filter(p => p.userId === userId);

module.exports = { findByFileId, findById, create, update, remove, findByUserId };
