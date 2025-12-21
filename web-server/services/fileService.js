/**
 * File Service - FINAL VERSION
 * Business logic with full Permission Inheritance
 */

const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient');

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

// --- Internal Helpers ---

/**
 * RECURSIVE Access Check (The logic we've built)
 * Checks permissions from the item up to the root.
 */
const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
    let currentId = fileId;
    let highestRoleFound = null;

    while (currentId !== null) {
        const item = fileRepository.getById(currentId);
        if (!item) break;

        // Owner always has full access
        if (item.ownerId === userId) return true;

        const permissions = permissionRepository.findByFileId(currentId) || [];
        const userPerm = permissions.find(p => p.userId === userId);

        if (userPerm) {
            if (userPerm.role === 'editor') return true;
            if (userPerm.role === 'viewer') highestRoleFound = 'viewer';
        }
        currentId = item.parentId;
    }
    return requiredRole === 'viewer' ? highestRoleFound !== null : false;
};

const isDescendant = (fileId, folderId) => {
    let current = fileRepository.getById(fileId);
    while (current && current.parentId) {
        if (current.parentId === folderId) return true;
        current = fileRepository.getById(current.parentId);
    }
    return false;
};

const wouldCreateCycle = (itemId, newParentId) => {
    let cursor = newParentId ?? null;
    while (cursor !== null) {
        if (cursor === itemId) return true;
        const node = fileRepository.getById(cursor);
        if (!node) return false;
        cursor = node.parentId ?? null;
    }
    return false;
};

const collectSubtreeIds = (rootId) => {
    const stack = [rootId];
    const visited = new Set();
    const ids = [];
    while (stack.length > 0) {
        const currentId = stack.pop();
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        ids.push(currentId);
        const children = fileRepository.findByParent(currentId) || [];
        for (const child of children) stack.push(child.id);
    }
    return ids;
};

// --- Exported Methods ---

const listTopLevel = async (userId) => {
    const ownedFiles = fileRepository.findByParent(null, userId);
    const userPermissions = permissionRepository.findByUserId(userId) || [];
    const sharedItems = userPermissions
        .map(perm => fileRepository.getById(perm.fileId))
        .filter(item => item !== null);

    const allFiles = [...ownedFiles];
    sharedItems.forEach(item => {
        const isOwned = allFiles.some(f => f.id === item.id);
        const hasSharedAncestor = sharedItems.some(other => 
            other.id !== item.id && isDescendant(item.id, other.id)
        );
        if (!isOwned && !hasSharedAncestor) allFiles.push(item);
    });
    return allFiles;
};

const getById = async (userId, id) => {
    const item = fileRepository.getById(id);
    if (!item) throw { status: 404, message: 'File or folder not found' };

    if (!(await checkAccess(userId, id, 'viewer'))) {
        throw { status: 403, message: 'Access denied' };
    }

    const result = { ...item };
    if (item.type === 'file') {
        try {
            const content = await sendTcpCommand(`GET ${id}`);
            result.content = content;
        } catch (err) {
            result.content = (err.message && err.message.includes('not found')) ? "" : (() => { throw err; })();
        }
    }
    return result;
};

const createItem = async (ownerId, payload) => {
    const { name, type, parentId = null, content = "" } = payload;
    if (!name || typeof name !== 'string' || name.trim() === '') throw { status: 400, message: 'Name is required' };
    if (!type || !assertValidType(type)) throw { status: 400, message: 'Invalid type' };

    if (parentId) {
        const parent = fileRepository.getById(parentId);
        if (!parent || parent.type !== 'folder') throw { status: 400, message: 'Invalid parent' };
        // Check if user can create in this folder
        if (!(await checkAccess(ownerId, parentId, 'editor'))) throw { status: 403, message: 'No permission to create here' };
    }

    const id = generateId();
    const ts = nowIso();
    if (type === 'file') await sendTcpCommand(`POST ${id} ${content}`);

    return fileRepository.create({ id, name: name.trim(), type, ownerId, parentId, createdAt: ts, updatedAt: ts });
};

const updateItem = async (userId, id, patch) => {
    if (!(await checkAccess(userId, id, 'editor'))) throw { status: 403, message: 'Editor access required' };
    
    const current = fileRepository.getById(id);
    if (patch.type) throw { status: 400, message: 'Type cannot be updated' };

    const updates = { updatedAt: nowIso() };
    if (patch.content !== undefined && current.type === 'file') {
        await sendTcpCommand(`POST ${id} ${patch.content}`);
    } else if (patch.content !== undefined) {
        throw { status: 400, message: 'Folders have no content' };
    }

    if (patch.name) updates.name = patch.name.trim();
    if (patch.parentId !== undefined) {
        if (patch.parentId === id || (patch.parentId && wouldCreateCycle(id, patch.parentId))) {
            throw { status: 400, message: 'Invalid parentId (Cycle detected)' };
        }
        updates.parentId = patch.parentId;
    }

    return fileRepository.update(id, updates);
};

const deleteItem = async (userId, id) => {
    const item = fileRepository.getById(id);
    if (!item) throw { status: 404, message: 'Not found' };

    // Strict: Only owner can delete (as discussed)
    if (item.ownerId !== userId) throw { status: 403, message: 'Only owner can delete' };

    const idsToDelete = collectSubtreeIds(id);
    for (const dId of idsToDelete.reverse()) {
        const target = fileRepository.getById(dId);
        if (target && target.type === 'file') await sendTcpCommand(`DELETE ${dId}`).catch(() => {});
        fileRepository.remove(dId);
        permissionRepository.removeAllByFileId(dId);
    }
    return { id };
};

const searchItems = async (userId, query) => {
    const nameMatches = fileRepository.searchFiles(query).filter(f => checkAccess(userId, f.id, 'viewer'));
    let contentMatchIds = [];
    try {
        const response = await sendTcpCommand(`SEARCH ${query}`);
        if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0);
    } catch (err) {}

    const contentMatches = contentMatchIds
        .map(id => fileRepository.getById(id))
        .filter(f => f && checkAccess(userId, f.id, 'viewer'));

    const all = [...nameMatches, ...contentMatches];
    return Array.from(new Map(all.map(i => [i.id, i])).values());
};

module.exports = { listTopLevel, createItem, getById, updateItem, deleteItem, searchItems };