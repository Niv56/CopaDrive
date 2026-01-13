const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient');
const { getProvider } = require("../storage/storageProvider");
const permissionService = require("./permissionService");

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

const TRASH_TTL_DAYS = 30;
const TRASH_TTL_MS = TRASH_TTL_DAYS * 24 * 60 * 60 * 1000;

const QUOTA_BYTES = 15 * 1024 * 1024 * 1024; // 15GB

// Check access recursively up to the root (owner always allowed).
const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
  let currentId = fileId;
  let highestRoleFound = null;

  while (currentId !== null) {
    const item = fileRepository.findById(currentId);
    if (!item) break;

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

// Compute UTF-8 byte length for content.
const contentSizeBytes = (content) => {
  if (content === undefined || content === null) return 0;
  const s = typeof content === 'string' ? content : String(content);
  return Buffer.byteLength(s, 'utf8');
};

// Check whether fileId is inside folderId subtree.
const isDescendant = (fileId, folderId) => {
  let current = fileRepository.findById(fileId);
  while (current && current.parentId) {
    if (current.parentId === folderId) return true;
    current = fileRepository.findById(current.parentId);
  }
  return false;
};

// Detect cycles when moving folders.
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

// Collect all ids in a subtree (including root).
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

// Normalize an input to an array.
const ensureArray = (v) => Array.isArray(v) ? v : [];

// Get per-user trashedAt value from item.trashedAtBy map.
const getTrashedAtForUser = (item, userId) => {
  const map = item?.trashedAtBy && typeof item.trashedAtBy === 'object' ? item.trashedAtBy : {};
  return map[userId] || null;
};

// Calculate remaining trash TTL days for a given trashedAt timestamp.
const calcDaysLeft = (trashedAt) => {
  if (!trashedAt) return null;
  const t = new Date(trashedAt).getTime();
  if (Number.isNaN(t)) return null;
  const expireAt = t + TRASH_TTL_MS;
  const msLeft = expireAt - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  return daysLeft;
};

// Add user-specific flags (starred/important/trashed + TTL) to an item.
const decorateFlagsForUser = (item, userId) => {
  const starredBy = ensureArray(item.starredBy);
  const importantBy = ensureArray(item.importantBy);
  const trashedBy = ensureArray(item.trashedBy);

  const trashed = trashedBy.includes(userId);
  const trashedAt = trashed ? getTrashedAtForUser(item, userId) : null;

  return {
    ...item,
    starred: starredBy.includes(userId),
    important: importantBy.includes(userId),
    trashed,
    trashedAt,
    trashDaysLeft: trashed ? calcDaysLeft(trashedAt) : null,
  };
};

// Decorate a list of items with user-specific flags.
const decorateListForUser = (items, userId) => items.map(i => decorateFlagsForUser(i, userId));

// Check whether an item is trashed for a given user.
const isTrashedForUser = (item, userId) => {
  const trashedBy = ensureArray(item?.trashedBy);
  return trashedBy.includes(userId);
};

// List all accessible items (owned + shared expanded), optionally including trashed items per-user.
const listAllAccessible = async (userId, { includeTrashed = false } = {}) => {
  const provider = getProvider();

  if (provider.name === "local") {
    const db = provider.readDB();
    const items = db.files.filter(f => f.ownerId === userId);
    const decorated = decorateListForUser(items, userId);
    return includeTrashed ? decorated : decorated.filter(i => !i.trashed);
  }

  const ownedRoots = fileRepository.findByParent(null, userId);

  const userPermissions = permissionRepository.findByUserId(userId) || [];
  const sharedRoots = userPermissions
    .map(perm => fileRepository.findById(perm.fileId))
    .filter(Boolean);

  const roots = [...ownedRoots];
  for (const item of sharedRoots) {
    const already = roots.some(r => r.id === item.id);
    const hasAncestorInShared = sharedRoots.some(other =>
      other.id !== item.id && isDescendant(item.id, other.id)
    );
    if (!already && !hasAncestorInShared) roots.push(item);
  }

  const result = new Map();

  for (const root of roots) {
    const ids = collectSubtreeIds(root.id);
    for (const id of ids) {
      if (await checkAccess(userId, id, 'viewer')) {
        const item = fileRepository.findById(id);
        if (item) result.set(item.id, item);
      }
    }
  }

  const decorated = decorateListForUser(Array.from(result.values()), userId);
  return includeTrashed ? decorated : decorated.filter(i => !i.trashed);
};

// List top-level accessible items (excluding trash).
const listTopLevel = async (userId) => {
  return listAllAccessible(userId, { includeTrashed: false });
};

// Get a file/folder by id (including file content for files) and decorate for user.
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

// Create a file/folder (and persist file content in the TCP storage for files).
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

  const created = fileRepository.create({
    id,
    name: name.trim(),
    type,
    ownerId,
    parentId,
    createdAt: ts,
    updatedAt: ts,
    sizeBytes,
    starredBy: [],
    importantBy: [],
    trashedBy: [],
    trashedAtBy: {},
  });

  try {
    permissionService.addPermission(ownerId, id, { userId: ownerId }, "owner");
  } catch (_) { }

  return created;
};

// Update file/folder metadata (and file content via TCP storage when patch.content is provided).
const updateItem = async (userId, id, patch) => {
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

  const current = fileRepository.findById(id);
  if (!current) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

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
        try {
          await sendTcpCommand(`DELETE ${id}`);
        } catch (deleteErr) {
          console.warn(`[Update] Physical delete failed for id ${id} (proceeding to create):`, deleteErr.message);
        }

        await sendTcpCommand(`POST ${id} ${patch.content}`);
        updates.sizeBytes = contentSizeBytes(patch.content);
      } catch (err) {
        throw err;
      }
    }
  }

  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim() === '') {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      throw err;
    }
    updates.name = patch.name.trim();
  }

  if (patch.parentId !== undefined) {
    const newParentId = patch.parentId ?? null;

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

// Mark/unmark an item as trashed for the user (folders apply to subtree on trash).
const setTrashed = async (userId, id, trashed) => {
  const item = fileRepository.findById(id);
  if (!item) {
    const err = new Error("File or folder not found");
    err.status = 404;
    throw err;
  }

  if (!(await checkAccess(userId, id, "viewer"))) {
    const err = new Error("Access denied");
    err.status = 403;
    throw err;
  }

  const ids =
    item.type === "folder"
      ? (trashed ? collectSubtreeIds(id) : [id])
      : [id];

  for (const tId of ids) {
    const target = fileRepository.findById(tId);
    if (!target) continue;

    const cur = ensureArray(target.trashedBy);
    const has = cur.includes(userId);

    let next = cur;
    if (trashed && !has) next = [...cur, userId];
    if (!trashed && has) next = cur.filter((x) => x !== userId);

    const trashedAtBy =
      target.trashedAtBy && typeof target.trashedAtBy === "object"
        ? { ...target.trashedAtBy }
        : {};

    if (trashed) {
      if (!trashedAtBy[userId]) trashedAtBy[userId] = nowIso();
    } else {
      delete trashedAtBy[userId];
    }

    const patch = { trashedBy: next, trashedAtBy };

    if (!trashed && target.ownerId === userId) {
      const pid = target.parentId ?? null;
      if (pid !== null) {
        const parent = fileRepository.findById(pid);
        const parentBad =
          !parent || parent.type !== "folder" || isTrashedForUser(parent, userId);

        if (parentBad) {
          patch.parentId = null;
        }
      }
    }

    fileRepository.update(tId, patch);
  }

  return decorateFlagsForUser(fileRepository.findById(id), userId);
};

// List trashed items for the user.
const listTrash = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: true });
  return all.filter(i => i.trashed === true);
};

// Soft-delete an item by moving it to trash.
const deleteItem = async (userId, id) => {
  await setTrashed(userId, id, true);
  return { id };
};

// Permanently delete for this user (owner hard-deletes; non-owner removes from their view).
const deleteForever = async (userId, id) => {
  const item = fileRepository.findById(id);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  if (!(await checkAccess(userId, id, 'viewer'))) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  if (!isTrashedForUser(item, userId)) {
    const err = new Error('Item is not in trash');
    err.status = 409;
    throw err;
  }

  if (item.ownerId !== userId) {
    await setTrashed(userId, id, false);

    if (typeof permissionRepository.revokeUserAccess === 'function') {
      try { permissionRepository.revokeUserAccess(id, userId); } catch (_) {}
    } else if (typeof permissionService.removePermission === 'function') {
      try { permissionService.removePermission(userId, id, userId); } catch (_) {}
    }

    return { id };
  }

  const ids = item.type === 'folder' ? collectSubtreeIds(id).reverse() : [id];

  for (const dId of ids) {
    const target = fileRepository.findById(dId);
    if (!target) continue;

    if (target.type === 'file') {
      await sendTcpCommand(`DELETE ${dId}`).catch(() => {});
    }
    fileRepository.remove(dId);
  }

  return { id };
};

// Empty the user's trash (folders processed first to avoid double deletes).
const emptyTrash = async (userId) => {
  const trashedItems = await listTrash(userId);
  const uniqueIds = Array.from(new Set(trashedItems.map(i => i.id)));

  const items = uniqueIds
    .map(id => fileRepository.findById(id))
    .filter(Boolean)
    .sort((a, b) => (a.type === 'folder' && b.type !== 'folder' ? -1 : a.type !== 'folder' && b.type === 'folder' ? 1 : 0));

  for (const it of items) {
    const stillThere = fileRepository.findById(it.id);
    if (!stillThere) continue;
    if (!isTrashedForUser(stillThere, userId)) continue;

    await deleteForever(userId, stillThere.id);
  }

  return { ok: true };
};

// Set/unset a per-user list-based flag on an item.
const setUserFlag = async (userId, id, flagKey, enabled) => {
  const item = fileRepository.findById(id);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

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

  const updated = fileRepository.update(id, { [flagKey]: next });
  return decorateFlagsForUser(updated, userId);
};

// Mark/unmark as starred for the user.
const setStarred = async (userId, id, starred) => setUserFlag(userId, id, 'starredBy', starred);

// Mark/unmark as important for the user.
const setImportant = async (userId, id, important) => setUserFlag(userId, id, 'importantBy', important);

// List starred items for the user (excluding trash).
const listStarred = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });
  return all.filter(i => i.starred === true);
};

// List important items for the user (excluding trash).
const listImportant = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });
  return all.filter(i => i.important === true);
};

// Search accessible items by name and by content (excluding items trashed by the user).
const searchItems = async (userId, query) => {
  const nameMatches = fileRepository.searchFiles(userId, query).filter(f => !isTrashedForUser(f, userId));

  let contentMatchIds = [];
  try {
    const response = await sendTcpCommand(`SEARCH ${query}`);
    if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0);
  } catch (err) {}

  const contentMatches = contentMatchIds
    .map(id => fileRepository.findById(id))
    .filter(f => f && !isTrashedForUser(f, userId));

  const all = [...nameMatches, ...contentMatches];
  const unique = Array.from(new Map(all.map(i => [i.id, i])).values());
  return decorateListForUser(unique, userId).filter(i => !i.trashed);
};

// Calculate storage usage for files owned by the user.
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
  deleteForever,
  emptyTrash,

  searchItems,

  setStarred,
  setImportant,
  listStarred,
  listImportant,

  setTrashed,
  listTrash,

  getOwnedStorageUsage,
};
