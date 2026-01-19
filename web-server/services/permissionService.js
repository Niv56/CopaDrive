const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');


// Give a new permission
 
async function addPermission(ownerId, fileId, targetUserId, role = 'viewer') {
    const file = await fileRepository.findById(fileId);
    
    if (!file || String(file.ownerId) !== String(ownerId)) {
        const err = new Error('Only the owner can share this file.');
        err.status = 403;
        throw err;
    }
    
    const existing = await permissionRepository.findByUserAndFile(targetUserId, fileId);
    if (existing) {
        const err = new Error('Permission already exists');
        err.status = 400;
        throw err;
    }
    
    return await permissionRepository.create({
        userId: targetUserId,
        fileId,
        role
    });
}


 // Gets all permissions for a file with user's role
 
async function getPermissions(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    
    if (!file) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const isOwner = String(file.ownerId) === String(userId);
    const myPerm = await permissionRepository.findByUserAndFile(userId, fileId);
    const myRole = isOwner ? 'owner' : (myPerm ? myPerm.role : null);
    
    if (!myRole) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    
    const permissions = await permissionRepository.findByFile(fileId);
    
    return {
        myRole,
        permissions: permissions.map(p => ({
            id: p._id,
            userId: p.userId._id || p.userId,
            email: p.userId.email,
            firstName: p.userId.firstName,
            lastName: p.userId.lastName,
            image: p.userId.image,
            role: p.role
        }))
    };
}

// Updates a permission role
async function updatePermission(ownerId, fileId, permissionId, newRole) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || String(file.ownerId) !== String(ownerId)) {
        const err = new Error('Only the owner can change sharing permissions.');
        err.status = 403;
        throw err;
    }
    
    // Find permission by its ID directly
    const perm = await permissionRepository.findById(permissionId);
    if (!perm || String(perm.fileId) !== String(fileId)) {
        const err = new Error('Permission not found');
        err.status = 404;
        throw err;
    }
    
    const toggledRole = perm.role === 'viewer' ? 'editor' : 'viewer';
    
    return await permissionRepository.update(perm._id, { role: newRole || toggledRole });
}


// Deletes a permission
 
async function deletePermission(ownerId, fileId, permissionId) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || String(file.ownerId) !== String(ownerId)) {
        const err = new Error('Only the owner can remove sharing permissions.');
        err.status = 403;
        throw err;
    }
    
    await permissionRepository.deleteById(permissionId);
}

module.exports = {
    addPermission,
    getPermissions,
    updatePermission,
    deletePermission
};