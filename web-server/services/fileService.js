/**
 * File Service - FINAL FIXED VERSION
 * Fixed: updateItem now calls repository without userId to allow editors to update files.
 */

const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient');

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

// --- Internal Helpers ---

/**
 * RECURSIVE Access Check
 * Checks permissions from the item up to the root.
 */
const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
    let currentId = fileId;
    let highestRoleFound = null;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId); 
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
    let current = fileRepository.findById(fileId);
    while (current && current.parentId) {
        if (current.parentId === folderId) return true;
        current = fileRepository.findById(current.parentId);
    }
    return false;
};

const wouldCreateCycle = (itemId, newParentId) => {
    let cursor = newParentId ?? null;
    while (cursor !== null) {
        if (cursor === itemId) return true;
        const node = fileRepository.findById(cursor);
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
        .map(perm => fileRepository.findById(perm.fileId))
        .filter(item => item !== undefined && item !== null);

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
    const item = fileRepository.findById(id);
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
        const parent = fileRepository.findById(parentId);
        if (!parent || parent.type !== 'folder') throw { status: 400, message: 'Invalid parent' };
        if (!(await checkAccess(ownerId, parentId, 'editor'))) throw { status: 403, message: 'No permission to create here' };
    }

    const id = generateId();
    const ts = nowIso();
    
    if (type === 'file') {
        await sendTcpCommand(`POST ${id} ${content}`);
    }

    return fileRepository.create({ id, name: name.trim(), type, ownerId, parentId, createdAt: ts, updatedAt: ts });
};

const updateItem = async (userId, id, patch) => {
  // 1. Input Validation
  if (!patch || typeof patch !== 'object') {
    const err = new Error('Invalid JSON body');
    err.status = 400;
    throw err;
  }

  if (patch.type !== undefined) {
    const err = new Error('Type cannot be updated');
    err.status = 400;
    throw err;
  }

  // 2. Fetch Current Item (MOVED UP)
  // We verify existence BEFORE permissions to satisfy the requirement:
  // "Non-existent id returns 404 Not Found" (instead of 403).
  const current = fileRepository.findById(id); 
  
  if (!current) {
    const err = new Error('File or folder not found');
    err.status = 404; // Returns 404 correctly
    throw err;
  }

  // 3. Security Check (MOVED DOWN)
  // Now that we know the file exists, we check if the user has 'editor' access.
  if (!(await checkAccess(userId, id, 'editor'))) {
    const err = new Error('Editor access required');
    err.status = 403;
    throw err;
  }

  const updates = {};

  // --- Handle Content Update ---
  if (patch.content !== undefined) {
      if (current.type === 'folder') {
          const err = new Error('Cannot update content of a folder');
          err.status = 400; 
          throw err;
      }

      if (current.type === 'file') {
          try {
              // WORKAROUND: The C++ TCP Server does not support 'UPDATE' or overwriting via POST.
              // To update content, we must:
              // 1. Delete the existing physical file.
              // 2. Create a new file with the new content using the SAME ID.

              // Step 1: Attempt to delete the old physical file
              try {
                  await sendTcpCommand(`DELETE ${id}`);
              } catch (deleteErr) {
                  // Soft Fail: If file didn't exist on TCP server, log warning but proceed to create it.
                  console.warn(`[Update] Physical delete failed for id ${id} (proceeding to create):`, deleteErr.message);
              }

              // Step 2: Post the new content reusing the existing ID
              await sendTcpCommand(`POST ${id} ${patch.content}`);

          } catch (err) {
              throw err; 
          }
      }
  }

  // --- Handle Name Update ---
  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim() === '') {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      throw err;
    }
    updates.name = patch.name.trim();
  }

  // --- Handle Move (ParentId) ---
  if (patch.parentId !== undefined) {
    const newParentId = patch.parentId ?? null;

    // Prevent setting itself as parent
    if (newParentId === id) {
      const err = new Error('parentId cannot be the same as id');
      err.status = 400;
      throw err;
    }

    if (newParentId !== null) {
      const parent = fileRepository.findById(newParentId);
      
      if (!parent) {
        const err = new Error('Parent folder not found');
        err.status = 404;
        throw err;
      }
      if (parent.type !== 'folder') {
        const err = new Error('Parent must be a folder');
        err.status = 400;
        throw err;
      }
      
      // Cycle detection (Only relevant when moving a folder)
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId)) {
        const err = new Error('Cannot move a folder into its own descendant');
        err.status = 409;
        throw err;
      }
    }

    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();

  // Final DB Update
  // We do NOT pass 'userId' here. Since we already validated permissions via checkAccess(),
  // we allow the update to proceed regardless of who the owner is (enabling shared editing).
  const updated = fileRepository.update(id, updates); 
  return updated;
};

const deleteItem = async (userId, id) => {
    const item = fileRepository.findById(id);
    if (!item) throw { status: 404, message: 'Not found' };

    // Strict: Only owner can delete
    if (item.ownerId !== userId) throw { status: 403, message: 'Only owner can delete' };

    const idsToDelete = collectSubtreeIds(id);
    for (const dId of idsToDelete.reverse()) {
        const target = fileRepository.findById(dId);
        
        if (target && target.type === 'file') {
             await sendTcpCommand(`DELETE ${dId}`).catch(() => {});
        }
        fileRepository.remove(dId);
    }
    return { id };
};

const searchItems = async (userId, query) => {
    const nameMatches = fileRepository.searchFiles(userId, query).filter(f => checkAccess(userId, f.id, 'viewer'));
    let contentMatchIds = [];
    try {
        const response = await sendTcpCommand(`SEARCH ${query}`);
        if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0);
    } catch (err) {}

    const contentMatches = contentMatchIds
        .map(id => fileRepository.findById(id))
        .filter(f => f && checkAccess(userId, f.id, 'viewer'));

    const all = [...nameMatches, ...contentMatches];
    return Array.from(new Map(all.map(i => [i.id, i])).values());
};

module.exports = {
  listTopLevel,
  createItem,
  getById,
  updateItem,
  deleteItem,
  searchItems
};