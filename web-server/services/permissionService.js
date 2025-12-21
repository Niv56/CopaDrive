
// Handles business logic for file and folder permissions
 
const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');
const { generateId } = require('../utils/idGenerator');


// Validates that the file exists and belongs to the owner
 
const verifyOwnership = (ownerId, fileId) => {
    // Check if the file exists and if the user is the owner
    const file = fileRepository.findById(fileId, ownerId);
    if (!file) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }
    return file;
};


 // Get all permissions for a specific file
exports.getPermissions = (ownerId, fileId) => {
    verifyOwnership(ownerId, fileId);
    return permissionRepository.findByFileId(fileId);
};


// Add a new permission entry
exports.addPermission = (ownerId, fileId, payload) => {
    verifyOwnership(ownerId, fileId);
    const newPermission = {
        id: generateId(), 
        fileId: fileId,
        userId: payload.userId,
        role: 'viewer'
    };

    return permissionRepository.create(newPermission);
};


// PATCH /api/files/:id/permissions/:pId - Update an existing permission entry 
exports.updatePermission = (ownerId, fileId, pId) => {
    verifyOwnership(ownerId, fileId);
        const permission = permissionRepository.findById(pId);

    if (!permission || permission.fileId !== fileId) {
        const error = new Error('Permission not found');
        error.status = 404;
        throw error;
    }

    const newRole = (permission.role === 'viewer') ? 'editor' : 'viewer';

    return permissionRepository.update(pId, { role: newRole });
};

 // Delete a permission entry
exports.deletePermission = (ownerId, fileId, pId) => {
    verifyOwnership(ownerId, fileId);

    const removed = permissionRepository.remove(pId);
    if (!removed) {
        const err = new Error('Permission not found');
        err.status = 404;
        throw err;
    }
    return removed;
};