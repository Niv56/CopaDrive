const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient');
const { getProvider } = require("../storage/storageProvider");


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
const contentSizeBytes = (content) => {
  if (content === undefined || content === null) return 0;
  const s = typeof content === 'string' ? content : String(content);
  return Buffer.byteLength(s, 'utf8');
};

const QUOTA_BYTES = 15 * 1024 * 1024 * 1024; // 15GB

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
const ensureArray = (v) => Array.isArray(v) ? v : [];

const decorateFlagsForUser = (item, userId) => {
  const starredBy = ensureArray(item.starredBy);
  const importantBy = ensureArray(item.importantBy);

  return {
    ...item,
    starred: starredBy.includes(userId),
    important: importantBy.includes(userId),
  };
};

const decorateListForUser = (items, userId) => items.map(i => decorateFlagsForUser(i, userId));


// --- Exported Methods ---
const listTopLevel = async (userId) => {

  const provider = getProvider();
if (provider.name === "local") {
  const db = provider.readDB();
  return decorateListForUser(
  db.files.filter(f => f.parentId === null && f.ownerId === userId),
  userId
);

}

  // 1) roots: owned top-level
  const ownedRoots = fileRepository.findByParent(null, userId);

  // 2) roots: shared items (directly shared to user)
  const userPermissions = permissionRepository.findByUserId(userId) || [];
  const sharedRoots = userPermissions
    .map(perm => fileRepository.findById(perm.fileId))
    .filter(Boolean);

  // 3) merge unique roots (avoid duplicates + avoid nested shared duplicates)
  const roots = [...ownedRoots];
  for (const item of sharedRoots) {
    const already = roots.some(r => r.id === item.id);
    const hasAncestorInShared = sharedRoots.some(other =>
      other.id !== item.id && isDescendant(item.id, other.id)
    );
    if (!already && !hasAncestorInShared) roots.push(item);
  }

  // 4) EXPAND: return all accessible items under each root (including the root itself)
  const result = new Map(); // id -> item

  for (const root of roots) {
    const ids = collectSubtreeIds(root.id); // includes root + all descendants
    for (const id of ids) {
      if (await checkAccess(userId, id, 'viewer')) {
        const item = fileRepository.findById(id);
        if (item) result.set(item.id, item);
      }
    }
  }

     return decorateListForUser(Array.from(result.values()), userId);
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
    return decorateFlagsForUser(result, userId);

};

const createItem = async (ownerId, payload) => {
  const { name, type, parentId = null, content = "" } = payload;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw { status: 400, message: 'Name is required' };
  }
  if (!type || !assertValidType(type)) {
    throw { status: 400, message: 'Invalid type' };
  }

  if (parentId) {
    const parent = fileRepository.findById(parentId);
    if (!parent || parent.type !== 'folder') throw { status: 400, message: 'Invalid parent' };
    if (!(await checkAccess(ownerId, parentId, 'editor'))) throw { status: 403, message: 'No permission to create here' };
  }

  const id = generateId();
  const ts = nowIso();

  let sizeBytes = 0;

  if (type === 'file') {
    await sendTcpCommand(`POST ${id} ${content}`);
    sizeBytes = contentSizeBytes(content);
  }

  return fileRepository.create({
    id,
    name: name.trim(),
    type,
    ownerId,
    parentId,
    createdAt: ts,
    updatedAt: ts,
    sizeBytes,               // ✅ חדש
    starredBy: [],
    importantBy: []
  });
};


const updateItem = async (userId, id, patch) => {
  // Input Validation
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

  // Fetch Current Item (MOVED UP)
  const current = fileRepository.findById(id); 
  
  if (!current) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // Security Check (MOVED DOWN)
  if (!(await checkAccess(userId, id, 'editor'))) {
    const err = new Error('Editor access required');
    err.status = 403;
    throw err;
  }

  const updates = {};

  if (patch.content !== undefined) {
      if (current.type === 'folder') {
          const err = new Error('Cannot update content of a folder');
          err.status = 400; 
          throw err;
      }

      if (current.type === 'file') {
          try {
              // Attempt to delete the old physical file
              try {
                  await sendTcpCommand(`DELETE ${id}`);
              } catch (deleteErr) {
                  console.warn(`[Update] Physical delete failed for id ${id} (proceeding to create):`, deleteErr.message);
              }

              // Post the new content reusing the existing ID
              await sendTcpCommand(`POST ${id} ${patch.content}`);
              updates.sizeBytes = contentSizeBytes(patch.content);


          } catch (err) {
              throw err; 
          }
      }
  }

  // Handle Name Update
  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim() === '') {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      throw err;
    }
    updates.name = patch.name.trim();
  }

  // Handle Move (ParentId)
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

  const updated = fileRepository.update(id, updates); 
  return updated;
};

const deleteItem = async (userId, id) => {
    const item = fileRepository.findById(id);
    if (!item) throw { status: 404, message: 'Not found' };

    // Only owner can delete
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
const setUserFlag = async (userId, id, flagKey, enabled) => {
  const item = fileRepository.findById(id);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // viewer מספיק (כי זה רק “תיוג” אישי)
  if (!(await checkAccess(userId, id, 'viewer'))) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  const current = ensureArray(item[flagKey]);
  const has = current.includes(userId);

  let next = current;
  if (enabled && !has) next = [...current, userId];
  if (!enabled && has) next = current.filter(x => x !== userId);

  const updated = fileRepository.update(id, { [flagKey]: next }); // לא נוגעים updatedAt כדי לא לשבור לוגיקות אחרות
  return decorateFlagsForUser(updated, userId);
};

const setStarred = async (userId, id, starred) => {
  return setUserFlag(userId, id, 'starredBy', starred);
};

const setImportant = async (userId, id, important) => {
  return setUserFlag(userId, id, 'importantBy', important);
};

const listStarred = async (userId) => {
  const all = await listTopLevel(userId); // כבר כולל shared + decorate
  return all.filter(i => i.starred === true);
};

const listImportant = async (userId) => {
  const all = await listTopLevel(userId);
  return all.filter(i => i.important === true);
};
const getOwnedStorageUsage = async (userId) => {
  const all = fileRepository.findAll();

  const ownedFiles = all.filter(f => f.ownerId === userId && f.type === 'file');

  const usedBytes = ownedFiles.reduce((sum, f) => {
    const s = typeof f.sizeBytes === 'number' ? f.sizeBytes : 0;
    return sum + s;
  }, 0);

  const percent = QUOTA_BYTES > 0 ? usedBytes / QUOTA_BYTES : 0;

  return {
    usedBytes,
    quotaBytes: QUOTA_BYTES,
    percent,
  };
};


module.exports = {
  listTopLevel,
  createItem,
  getById,
  updateItem,
  deleteItem,
  searchItems,
  setStarred,
  setImportant,
  listStarred,
  listImportant,
  getOwnedStorageUsage, // ✅ חדש
};
