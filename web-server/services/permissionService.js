const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');
const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');


const verifyOwnership = (ownerId, fileId) => {
    const file = fileRepository.findById(fileId, ownerId);
    if (!file) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }
    return file;
};


exports.getPermissions = (ownerId, fileId) => {
    verifyOwnership(ownerId, fileId);
    return permissionRepository.findByFileId(fileId);
};


// Add a new permission entry
exports.addPermission = (ownerId, fileId, payload) => {
    verifyOwnership(ownerId, fileId);

    // Validate that the target user exists
    const targetUser = userRepository.findById(payload.userId);
    if (!targetUser) {
        const err = new Error('User to grant permission to not found');
        err.status = 404;
        throw err;
    }

    // Check for duplicates
    const existingPermissions = permissionRepository.findByFileId(fileId);
    const duplicate = existingPermissions.find(p => p.userId === payload.userId);
    
    if (duplicate) {
        const err = new Error('Permission already exists for this user');
        err.status = 409;
        throw err;
    }

    const newPermission = {
        id: generateId((id) => permissionRepository.findById(id)), 
        fileId: fileId,
        userId: payload.userId,
        role: 'viewer'
    };

    return permissionRepository.create(newPermission);
};


// Update an existing permission entry 
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

const checkAccess = (userId, fileId, requiredRole = 'viewer') => {
    let currentId = fileId;
    let foundPermission = null;

    // Iterate from the target file up to the root
    while (currentId !== null) {
        const item = fileRepository.getById(currentId);
        if (!item) break;

        // Owner check If user owns any folder in the path, they have full access
        if (item.ownerId === userId) return true;

        // Look for an explicit permission entry for this user at this level
        const permissions = permissionRepository.findByFileId(currentId) || [];
        const userPerm = permissions.find(p => p.userId === userId);

        if (userPerm) {
            // If the user has 'editor' role at this level, it's the strongest possible
            if (userPerm.role === 'editor') return true;
            if (!foundPermission) foundPermission = userPerm.role;
        }

        currentId = item.parentId;
    }

    if (requiredRole === 'viewer') {
        return foundPermission !== null;
    } else if (requiredRole === 'editor') {
        return foundPermission === 'editor';
    }

    return false;
};