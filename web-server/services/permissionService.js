const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');
const mongoose = require('mongoose');

// Verify that the user owns the file
const verifyOwnership = async (ownerId, fileId) => {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        const err = new Error('Invalid file ID format');
        err.status = 400;
        throw err;
    }

    const file = await fileRepository.findById(fileId);
    
    if (!file || !file.ownerId.equals(ownerId)) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }
    
    return file;
};

// Find user's highest role by traversing file hierarchy
const resolveRole = async (userId, fileId) => {
    let currentId = fileId;
    let found = null;

    while (currentId !== null) {
        const item = await fileRepository.findById(currentId);
        if (!item) break;

        if (item.ownerId.toString() === userId.toString()) return "owner";

        const perms = await permissionRepository.findByFileId(currentId) || [];
        const userPerm = perms.find(p => p.userId.toString() === userId.toString());

        if (userPerm) {
            if (userPerm.role === "editor") return "editor";
            if (!found) found = "viewer";
        }

        currentId = item.parentId;
    }
    return found;
};

// Get all permissions including inherited ones
exports.getPermissions = async (requesterId, fileId) => {
    const role = await resolveRole(requesterId, fileId);
    if (!role) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }

    const allPermissions = new Map();
    let currentId = fileId;

    while (currentId !== null) {
        const item = await fileRepository.findById(currentId);
        if (!item) break;

        const perms = await permissionRepository.findByFileId(currentId) || [];
        for (const perm of perms) {
            if (!allPermissions.has(perm.userId.toString())) {
                allPermissions.set(perm.userId.toString(), perm);
            }
        }
        currentId = item.parentId;
    }

    const permissions = Array.from(allPermissions.values());
    const file = await fileRepository.findById(fileId);
    const blockedBy = file?.blockedBy && Array.isArray(file.blockedBy) ? file.blockedBy : [];

    return { myRole: role, permissions, blockedBy };
};

// Add new permission and unblock user if necessary
exports.addPermission = async (ownerId, fileId, payload) => {
    const file = await verifyOwnership(ownerId, fileId);
    const targetUserId = payload.userId;

    const unblock = async (id) => {
        const item = await fileRepository.findById(id);
        if (item && Array.isArray(item.blockedBy)) {
            const nextBlocked = item.blockedBy.filter(uid => uid.toString() !== targetUserId.toString());
            if (nextBlocked.length !== item.blockedBy.length) {
                await fileRepository.update(id, { blockedBy: nextBlocked });
            }
        }
    };

    const allFiles = await fileRepository.findAll();
    const toUnblock = [fileId];

    const collect = (pid) => {
        allFiles.filter(f => f.parentId?.toString() === pid.toString()).forEach(f => {
            toUnblock.push(f.id);
            if (f.type === 'folder') collect(f.id);
        });
    };

    if (file.type === 'folder') collect(fileId);
    
    for (const id of toUnblock) {
        await unblock(id);
    }

    const existingPermissions = await permissionRepository.findByFileId(fileId);
    const duplicate = existingPermissions.find(p => p.userId.toString() === targetUserId.toString());

    if (duplicate) {
        const err = new Error('Permission already exists for this user');
        err.status = 409;
        throw err;
    }

    const newPermission = {
        fileId: fileId,
        userId: targetUserId,
        role: 'viewer'
    };

    return await permissionRepository.create(newPermission);
};

// Toggle permission between viewer and editor
exports.updatePermission = async (ownerId, fileId, pId, role) => {
    await verifyOwnership(ownerId, fileId);
    const permission = await permissionRepository.findById(pId);

    if (!permission || permission.fileId.toString() !== fileId.toString()) {
        const error = new Error('Permission not found');
        error.status = 404;
        throw error;
    }

    const newRole = role || (permission.role === 'viewer' ? 'editor' : 'viewer');
    return await permissionRepository.update(pId, { role: newRole });
};

// Remove a permission entry
exports.deletePermission = async (ownerId, fileId, pId) => {
    await verifyOwnership(ownerId, fileId);

    const removed = await permissionRepository.remove(pId);
    if (!removed) {
        const err = new Error('Permission not found');
        err.status = 404;
        throw err;
    }
    return removed;
};

// Boolean check for specific access level
const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
    const role = await resolveRole(userId, fileId);
    
    if (!role) return false;
    if (role === 'owner' || role === 'editor') return true;
    return requiredRole === 'viewer';
};

exports.checkAccess = checkAccess;