const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const mongoose = require('mongoose');

const QUOTA_BYTES = 15 * 1024 * 1024 * 1024; // 15GB

/**
 * Helper: Get current ISO timestamp
 */
function now() {
    return new Date().toISOString();
}

/**
 * Helper: Calculate file size from base64 content
 */
function getContentSize(content) {
    if (!content) return 0;
    const base64 = content.includes(',') ? content.split(',')[1] : content;
    return Math.ceil((base64.length * 3) / 4);
}

/**
 * Helper: Check if user has permission to access a file
 */
async function canAccess(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) return false;
    
    if (String(file.ownerId) === String(userId)) return true;
    
    const perm = await permissionRepository.findByUserAndFile(userId, fileId);
    return !!perm;
}

/**
 * Helper: Get user's role for a file
 */
async function getUserRole(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    if (!file) return null;
    
    if (String(file.ownerId) === String(userId)) return 'owner';
    
    const perm = await permissionRepository.findByUserAndFile(userId, fileId);
    return perm ? perm.role : null;
}

/**
 * Lists top-level accessible items
 */
async function listTopLevel(userId) {
    const owned = await fileRepository.findTopLevel(userId);
    const shared = await permissionRepository.findSharedFiles(userId);
    
    const sharedIds = new Set(shared.map(p => String(p.fileId)));
    const ownedIds = new Set(owned.map(f => String(f._id)));
    
    const sharedFiles = await Promise.all(
        Array.from(sharedIds)
            .filter(id => !ownedIds.has(id))
            .map(id => fileRepository.findById(id))
    );
    
    return [...owned, ...sharedFiles.filter(Boolean)];
}

/**
 * Creates a new file or folder
 */
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
    
    // Check quota
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
    
    // Store content in C++ server if file
    if (type === 'file' && content) {
        const cppService = require('./cppStorageService');
        await cppService.storeFile(created._id, content);
    }
    
    return created;
}

/**
 * Gets file by ID with permission check
 */
async function getById(userId, fileId) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const file = await fileRepository.findById(fileId);
    
    // Fetch content from C++ server if file
    if (file.type === 'file') {
        const cppService = require('./cppStorageService');
        file.content = await cppService.getFile(fileId);
    }
    
    return file;
}

/**
 * Updates file metadata
 */
async function updateItem(userId, fileId, patch) {
    const role = await getUserRole(userId, fileId);
    
    if (!role || (role === 'viewer' && !patch.name)) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    
    const allowed = ['name', 'parentId', 'content', 'mimeType'];
    const update = { updatedAt: now() };
    
    for (const key of allowed) {
        if (patch[key] !== undefined) update[key] = patch[key];
    }
    
    // Update content in C++ server if changed
    if (patch.content !== undefined) {
        const file = await fileRepository.findById(fileId);
        if (file.type === 'file') {
            const cppService = require('./cppStorageService');
            await cppService.storeFile(fileId, patch.content);
            update.sizeBytes = getContentSize(patch.content);
        }
    }
    
    return await fileRepository.update(fileId, update);
}

/**
 * Soft-deletes a file (moves to trash)
 */
async function deleteItem(userId, fileId) {
    const role = await getUserRole(userId, fileId);
    
    if (role !== 'owner') {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    
    const file = await fileRepository.findById(fileId);
    
    await fileRepository.update(fileId, {
        trashed: true,
        trashedAt: new Date(),
        originalParentId: file.parentId,
        parentId: null,
        $addToSet: { trashedBy: userId },
        $set: { [`trashedAtBy.${userId}`]: new Date() }
    });
}

/**
 * Permanently deletes a file
 */
async function deleteForever(userId, fileId) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || String(file.ownerId) !== String(userId)) {
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
        const cppService = require('./cppStorageService');
        await cppService.deleteFile(fileId);
    }
    
    await permissionRepository.deleteByFile(fileId);
    await fileRepository.deleteById(fileId);
}

/**
 * Sets starred flag
 */
async function setStarred(userId, fileId, starred) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const update = starred
        ? { $addToSet: { starredBy: userId } }
        : { $pull: { starredBy: userId } };
    
    await fileRepository.update(fileId, update);
}

/**
 * Sets important flag
 */
async function setImportant(userId, fileId, important) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    const update = important
        ? { $addToSet: { importantBy: userId } }
        : { $pull: { importantBy: userId } };
    
    await fileRepository.update(fileId, update);
}

/**
 * Sets trashed flag (restore from trash)
 */
async function setTrashed(userId, fileId, trashed) {
    const file = await fileRepository.findById(fileId);
    
    if (!file || String(file.ownerId) !== String(userId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    if (trashed) {
        await deleteItem(userId, fileId);
    } else {
        // Restore
        await fileRepository.update(fileId, {
            trashed: false,
            trashedAt: null,
            parentId: file.originalParentId,
            originalParentId: null,
            $pull: { trashedBy: userId },
            $unset: { [`trashedAtBy.${userId}`]: '' }
        });
    }
}

/**
 * Lists starred items
 */
async function listStarred(userId) {
    return await fileRepository.findStarred(userId);
}

/**
 * Lists important items
 */
async function listImportant(userId) {
    return await fileRepository.findImportant(userId);
}

/**
 * Lists trash
 */
async function listTrash(userId) {
    return await fileRepository.findTrashed(userId);
}

/**
 * Empties trash
 */
async function emptyTrash(userId) {
    const trashed = await fileRepository.findTrashed(userId);
    
    for (const item of trashed) {
        await deleteForever(userId, item._id);
    }
}

/**
 * Gets storage usage
 */
async function getOwnedStorageUsage(userId) {
    const usedBytes = await fileRepository.calculateOwnedStorage(userId);
    
    return {
        usedBytes,
        quotaBytes: QUOTA_BYTES
    };
}

/**
 * Lists recent files
 */
async function listRecent(userId) {
    return await fileRepository.findRecent(userId);
}

/**
 * Updates access time
 */
async function updateAccessTime(userId, fileId) {
    if (!await canAccess(userId, fileId)) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    
    await fileRepository.update(fileId, {
        $set: { [`lastAccessedBy.${userId}`]: new Date() }
    });
    
    return await fileRepository.findById(fileId);
}

/**
 * Searches items
 */
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
    
    return combined.filter(item => {
        if (!item || seen.has(String(item._id))) return false;
        seen.add(String(item._id));
        return true;
    });
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