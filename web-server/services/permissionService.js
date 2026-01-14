const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');
const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');

// Verify that the user owns the file
const verifyOwnership = (ownerId, fileId) => {
    const file = fileRepository.findById(fileId, ownerId);
    if (!file) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }
    return file;
};

// Find user's highest role by traversing file hierarchy
const resolveRole = (userId, fileId) => {
    let currentId = fileId;
    let found = null;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId); 
        if (!item) break;

        if (item.ownerId === userId) return "owner";

        const perms = permissionRepository.findByFileId(currentId) || [];
        const userPerm = perms.find(p => p.userId === userId);

        if (userPerm) {
            if (userPerm.role === "editor") return "editor";
            if (!found) found = "viewer";
        }

        currentId = item.parentId;
    }
    return found;
};

// Get all permissions including inherited ones and blocked users
exports.getPermissions = (requesterId, fileId) => {
    const role = resolveRole(requesterId, fileId);
    if (!role) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }

    const allPermissions = new Map();
    let currentId = fileId;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId);
        if (!item) break;

        const perms = permissionRepository.findByFileId(currentId) || [];
        for (const perm of perms) {
            if (!allPermissions.has(perm.userId)) {
                allPermissions.set(perm.userId, perm);
            }
        }
        currentId = item.parentId;
    }

    const permissions = Array.from(allPermissions.values());
    const file = fileRepository.findById(fileId);
    const blockedBy = file?.blockedBy && Array.isArray(file.blockedBy) ? file.blockedBy : [];

    return { myRole: role, permissions, blockedBy };
};

// Add new permission and unblock user if necessary
exports.addPermission = (ownerId, fileId, payload) => {
    verifyOwnership(ownerId, fileId);

    const targetUser = userRepository.findById(payload.userId);
    if (!targetUser) {
        const err = new Error('User to grant permission to not found');
        err.status = 404;
        throw err;
    }

    const file = fileRepository.findById(fileId);
    if (file && file.blockedBy && Array.isArray(file.blockedBy)) {
        const blockedBy = file.blockedBy.filter(uid => uid !== payload.userId);
        if (blockedBy.length !== file.blockedBy.length) {
            fileRepository.update(fileId, { blockedBy });
        }
    }

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

// Toggle permission between viewer and editor
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

// Remove a permission entry
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

// Boolean check for specific access level
const checkAccess = (userId, fileId, requiredRole = 'viewer') => {
    let currentId = fileId;
    let foundPermission = null;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId); 
        if (!item) break;

        if (item.ownerId === userId) return true;

        const permissions = permissionRepository.findByFileId(currentId) || [];
        const userPerm = permissions.find(p => p.userId === userId);

        if (userPerm) {
            if (userPerm.role === 'editor') return true;
            if (!foundPermission) foundPermission = userPerm.role;
        }

        currentId = item.parentId;
    }

    if (requiredRole === 'viewer') return foundPermission !== null;
    if (requiredRole === 'editor') return foundPermission === 'editor';
    return false;
};

exports.checkAccess = checkAccess;