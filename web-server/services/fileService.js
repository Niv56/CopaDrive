const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const mongoose = require('mongoose');

const QUOTA_BYTES = 15 * 1024 * 1024 * 1024; // 15GB


 // Get current ISO timestamp
 
function now() {
    return new Date().toISOString();
}


 // Helper: Calculate file size from base64 content
 
function getContentSize(content) {
    if (!content) return 0;
    const base64 = content.includes(',') ? content.split(',')[1] : content;
    return Math.ceil((base64.length * 3) / 4);
}


 // Safe ID comparison - ensures both IDs are strings
 
function idEquals(id1, id2) {
    const str1 = id1?.toString ? id1.toString() : String(id1);
    const str2 = id2?.toString ? id2.toString() : String(id2);
    return str1 === str2;
}


 // Check if user has permission to access a file
 
async function canAccess(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) return false;
    
    if (idEquals(file.ownerId, userId)) return true;
    
    const perm = await permissionRepository.findByUserAndFile(userId, fileId);
    return !!perm;
}


 // Get user role for a file
 
async function getUserRole(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) return null;
    
    if (idEquals(file.ownerId, userId)) return 'owner';
    
    const perm = await permissionRepository.findByUserAndFile(userId, fileId);
    return perm ? perm.role : null;
}


function transformFileForUser(file, userId) {
    if (!file) return null;
    
    const obj = file.toObject ? file.toObject() : { ...file };
    
    const userIdStr = String(userId);
    obj.starred = Array.isArray(obj.starredBy) && obj.starredBy.some(id => String(id) === userIdStr);
    obj.important = Array.isArray(obj.importantBy) && obj.importantBy.some(id => String(id) === userIdStr);
    
    return obj;
}


// ransform array of files for a specific user
 
function transformFilesForUser(files, userId) {
    return files.map(f => transformFileForUser(f, userId)).filter(Boolean);
}


 // Lists top-level 
 
async function listTopLevel(userId) {
    
    const owned = await fileRepository.findTopLevel(userId);
    
    const shared = await permissionRepository.findSharedFiles(userId);
    
    const sharedIds = new Set(shared.map(p => String(p.fileId)));
    const ownedIds = new Set(owned.map(f => String(f._id)));
    
    const sharedFiles = await Promise.all(
        Array.from(sharedIds)
            .filter(id => !ownedIds.has(id))
            .map(async id => {
                const file = await fileRepository.findById(id);
                if (file) {
                }
                return file;
            })
    );
    
    const nonTrashedSharedFiles = sharedFiles.filter(f => f && !f.trashed);    
    const allFiles = [...owned, ...nonTrashedSharedFiles];
    
    return transformFilesForUser(allFiles, userId);
}


 // Creates a new file or folder
 
async function createItem(ownerId, data) {
    
    const { name, type, parentId = null, content = '', mimeType = '' } = data;
    
    if (!name || !type) {
        const err = new Error('name and type are required');
        err.status = 400;
        throw err;
    }
    
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
        const err = new Error('Invalid parentId');
        err.status = 400;
        throw err;
    }
    
    const timestamp = now();
    const sizeBytes = type === 'file' ? getContentSize(content) : 0;
    
    if (type === 'file') {
        const currentUsage = await fileRepository.calculateOwnedStorage(ownerId);
        if (currentUsage + sizeBytes > QUOTA_BYTES) {
            const err = new Error('Storage quota exceeded');
            err.status = 413;
            throw err;
        }
    }
    
    const fileData = {
        name,
        type,
        ownerId,
        parentId,
        createdAt: timestamp,
        updatedAt: timestamp,
        sizeBytes,
        mimeType: type === 'file' ? mimeType : '',
        trashed: false,
        starredBy: [],
        importantBy: [],
        trashedBy: []
    };
    
    const created = await fileRepository.create(fileData);
    
    if (type === 'file' && content) {
        const cppService = require('./cppStorageService');
        await cppService.storeFile(created._id.toString(), content);
    }
    
    return transformFileForUser(created, ownerId);
}


// Gets file by ID with permission check 
async function getById(userId, fileId) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const file = await fileRepository.findById(fileId);
    const result = transformFileForUser(file, userId);
    
    if (result.type === 'file') {
        const cppService = require('./cppStorageService');
        result.content = await cppService.getFile(fileId);
    }
    
    return result;
}

// Updates file metadata 
async function updateItem(userId, fileId, patch) {
    const role = await getUserRole(userId, fileId);
    
    // No access at all
    if (!role) {
        const err = new Error('You do not have access to this file.');
        err.status = 403;
        throw err;
    }
    
    // Viewer cannot update anything
    if (role === 'viewer') {
        const err = new Error('You have view-only access. Contact the owner to request edit permission.');
        err.status = 403;
        throw err;
    }
    
    // Editor permission cannot move files (change the parentId)
    if (role === 'editor' && patch.parentId !== undefined) {
        const err = new Error('Only the owner can move this file to a different folder.');
        err.status = 403;
        throw err;
    }
    
    const allowedMongoFields = role === 'owner' 
        ? ['name', 'parentId', 'mimeType']
        : ['name', 'mimeType']; // editor
    
    const update = { updatedAt: now() };
    
    for (const key of allowedMongoFields) {
        if (patch[key] !== undefined) update[key] = patch[key];
    }
    
    // Update content in C++ server if changed the content is not in MongoDB
    if (patch.content !== undefined) {
        const file = await fileRepository.findById(fileId);
        if (file && file.type === 'file') {
            const cppService = require('./cppStorageService');
            const fileIdStr = fileId.toString ? fileId.toString() : String(fileId);
            await cppService.storeFile(fileIdStr, patch.content);
            update.sizeBytes = getContentSize(patch.content);
        }
    }
    
    const updated = await fileRepository.update(fileId, update);
    return transformFileForUser(updated, userId);
}

// Soft-deletes a file (moves to trash)
 
async function deleteItem(userId, fileId) {
    const role = await getUserRole(userId, fileId);
    
    if (role !== 'owner') {
        const err = new Error('Only the owner can delete this file.');
        err.status = 403;
        throw err;
    }
    
    const file = await fileRepository.findById(fileId);
    
    await fileRepository.update(fileId, {
        $set: {
            trashed: true,
            trashedAt: new Date(),
            originalParentId: file.parentId,
            parentId: null,
            [`trashedAtBy.${userId}`]: new Date()
        },
        $addToSet: { trashedBy: userId }
    });
}

// deletes a file forever
 
async function deleteForever(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || !idEquals(file.ownerId, userId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    // Recursively delete children
    if (file.type === 'folder') {
        const children = await fileRepository.findChildren(fileId);
        for (const child of children) {
            await deleteForever(userId, child._id);
        }
    }
    
    // Delete from C++ server 
    if (file.type === 'file') {
        try {
            const cppService = require('./cppStorageService');
            const fileIdStr = fileId.toString ? fileId.toString() : String(fileId);
            await cppService.deleteFile(fileIdStr);
        } catch (cppErr) {
            if (!cppErr.message?.includes('404')) {
                console.error('[deleteForever] C++ delete error (non-fatal):', cppErr.message);
            }
        }
    }
    
    await permissionRepository.deleteByFile(fileId);
    await fileRepository.deleteById(fileId);
}


 // Sets starred flag - Any user with access 
 
async function setStarred(userId, fileId, starred) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const update = starred
        ? { $addToSet: { starredBy: userId } }
        : { $pull: { starredBy: userId } };
    
    const updated = await fileRepository.update(fileId, update);
    return transformFileForUser(updated, userId);
}


 // Sets important flag - Any user with access 

async function setImportant(userId, fileId, important) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const update = important
        ? { $addToSet: { importantBy: userId } }
        : { $pull: { importantBy: userId } };
    
    const updated = await fileRepository.update(fileId, update);
    return transformFileForUser(updated, userId);
}


// Sets trashed flag 
async function setTrashed(userId, fileId, trashed) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || !idEquals(file.ownerId, userId)) {
        const err = new Error('Only the owner can move files to trash or restore them.');
        err.status = 403;
        throw err;
    }
    
    if (trashed) {
        await deleteItem(userId, fileId);
    } else {
        // Restore
        await fileRepository.update(fileId, {
            $set: {
                trashed: false,
                trashedAt: null,
                parentId: file.originalParentId,
                originalParentId: null
            },
            $pull: { trashedBy: userId },
            $unset: { [`trashedAtBy.${userId}`]: '' }
        });
    }
    
    const updated = await fileRepository.findById(fileId);
    return transformFileForUser(updated, userId);
}

 // Lists starred items
async function listStarred(userId) {
    const files = await fileRepository.findStarred(userId);
    return transformFilesForUser(files, userId);
}


// Lists important items
 
async function listImportant(userId) {
    const files = await fileRepository.findImportant(userId);
    return transformFilesForUser(files, userId);
}


// Lists trash
async function listTrash(userId) {
    const files = await fileRepository.findTrashed(userId);
    return transformFilesForUser(files, userId);
}


 // Empties trash
 
async function emptyTrash(userId) {
    const trashed = await fileRepository.findTrashed(userId);
    
    for (const item of trashed) {
        await deleteForever(userId, item._id);
    }
}

// Gets storage usage
async function getOwnedStorageUsage(userId) {
    const usedBytes = await fileRepository.calculateOwnedStorage(userId);
    
    return {
        usedBytes,
        quotaBytes: QUOTA_BYTES
    };
}


 // Lists recent files
 
async function listRecent(userId) {
    const files = await fileRepository.findRecent(userId);
    return transformFilesForUser(files, userId);
}

// Update access time
async function updateAccessTime(userId, fileId) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    await fileRepository.update(fileId, {
        $set: { [`lastAccessedBy.${userId}`]: new Date() }
    });
    
    const file = await fileRepository.findById(fileId);
    return transformFileForUser(file, userId);
}


 // Search items 
async function searchItems(userId, query) {
    if (!query) return [];
    
    const results = await fileRepository.search(userId, query);
    
    // Also search shared files
    const shared = await permissionRepository.findSharedFiles(userId);
    const sharedFiles = await Promise.all(
        shared.map(p => fileRepository.findById(p.fileId))
    );
    
    const regex = new RegExp(query, 'i');
    const matchingShared = sharedFiles.filter(f => f && regex.test(f.name));
    
    // Combine and deduplicate
    const combined = [...results, ...matchingShared];
    const seen = new Set();
    
    const deduplicated = combined.filter(item => {
        if (!item || seen.has(String(item._id))) return false;
        seen.add(String(item._id));
        return true;
    });
    
    return transformFilesForUser(deduplicated, userId);
}

module.exports = {
    listTopLevel,
    createItem,
    getById,
    updateItem,
    deleteItem,
    deleteForever,
    setStarred,
    setImportant,
    setTrashed,
    listStarred,
    listImportant,
    listTrash,
    emptyTrash,
    getOwnedStorageUsage,
    listRecent,
    updateAccessTime,
    searchItems
};