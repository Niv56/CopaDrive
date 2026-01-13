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

// --- Internal Helpers ---

/**
 * RECURSIVE Access Check
 * Checks permissions from the item up to the root.
 * Also respects blockedBy list (users who deleted the file permanently).
 */
const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
  let currentId = fileId;
  let highestRoleFound = null;

  while (currentId !== null) {
    const item = fileRepository.findById(currentId);
    if (!item) break;

    // Check if user blocked this item
    const blockedBy = ensureArray(item.blockedBy);
    if (blockedBy.includes(userId)) return false;

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

const getTrashedAtForUser = (item, userId) => {
  const map = item?.trashedAtBy && typeof item.trashedAtBy === 'object' ? item.trashedAtBy : {};
  return map[userId] || null;
};

const calcDaysLeft = (trashedAt) => {
  if (!trashedAt) return null;
  const t = new Date(trashedAt).getTime();
  if (Number.isNaN(t)) return null;
  const expireAt = t + TRASH_TTL_MS;
  const msLeft = expireAt - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  return daysLeft;
};

const decorateFlagsForUser = (item, userId) => {
  const starredBy = ensureArray(item.starredBy);
  const importantBy = ensureArray(item.importantBy);
  const trashedBy = ensureArray(item.trashedBy);

  const trashed = trashedBy.includes(userId);
  const trashedAt = trashed ? getTrashedAtForUser(item, userId) : null;

  const lastAccessedBy = item.lastAccessedBy && typeof item.lastAccessedBy === 'object'
    ? item.lastAccessedBy
    : {};
  const lastAccessed = lastAccessedBy[userId] || null;

  return {
    ...item,
    starred: starredBy.includes(userId),
    important: importantBy.includes(userId),
    trashed,
    trashedAt,
    trashDaysLeft: trashed ? calcDaysLeft(trashedAt) : null,
    lastAccessed
  };
};

const decorateListForUser = (items, userId) => items.map(i => decorateFlagsForUser(i, userId));

const isTrashedForUser = (item, userId) => {
  const trashedBy = ensureArray(item?.trashedBy);
  return trashedBy.includes(userId);
};

/**
 * Internal: returns all accessible items (owned + shared expanded),
 * and optionally includes trashed items (per-user).
 */
const listAllAccessible = async (userId, { includeTrashed = false } = {}) => {
  const provider = getProvider();

  // Local provider: keep behavior, but decorate & filter per-user
  if (provider.name === "local") {
    const db = provider.readDB();
    const items = db.files.filter(f => f.ownerId === userId);
    const decorated = decorateListForUser(items, userId);
    return includeTrashed ? decorated : decorated.filter(i => !i.trashed);
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

// --- Exported Methods ---

const listTopLevel = async (userId) => {
  return listAllAccessible(userId, { includeTrashed: false });
};

const getById = async (userId, id) => {
  const item = fileRepository.findById(id);
  if (!item) throw { status: 404, message: 'File or folder not found' };
  console.log(`GET_DEBUG 1: Metadata found for ID ${id}:`, item);

  if (!(await checkAccess(userId, id, 'viewer'))) {
    throw { status: 403, message: 'Access denied' };
  }

  const result = { ...item };

  if (item.type === 'file') {
    try {
      console.log(`GET_DEBUG 2: Sending TCP GET for ID: ${id}`);
      const content = await sendTcpCommand(`GET ${id}`);
      console.log(`GET_DEBUG 3: Content received from TCP (first 20 chars):`, content?.substring(0, 20));
      result.content = content;
    } catch (err) {
      result.content = (err.message && err.message.includes('not found')) ? "" : (() => { throw err; })();
    }
  }

  return decorateFlagsForUser(result, userId);
};

const createItem = async (ownerId, payload) => {
  console.log("SERVER DEBUG 1: Received payload:", payload);

  const { name, type, parentId = null, content = "", mimeType = "" } = payload;

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
    mimeType,
    starredBy: [],
    importantBy: [],
    trashedBy: [],
    trashedAtBy: {},
    lastAccessedBy: {},
    blockedBy: []
  });

  try {
    permissionService.addPermission(ownerId, id, { userId: ownerId }, "owner");
  } catch (_) { }
  console.log("SERVER DEBUG 2: Created object in DB:", created);
  return created;
};

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

  // 1. עדכון תוכן פיזי ב-C++ Core
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
          console.warn(`[Update] Physical delete failed for id ${id}:`, deleteErr.message);
        }

        await sendTcpCommand(`POST ${id} ${patch.content}`);
        updates.sizeBytes = contentSizeBytes(patch.content);
      } catch (err) {
        throw err;
      }
    }
  }

  // 2. עדכון mimeType (הועבר לכאן כדי שיפעל תמיד)
  if (patch.mimeType !== undefined) {
    updates.mimeType = patch.mimeType;
  }

  // 3. עדכון שם הקובץ/תיקייה
  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim() === '') {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      throw err;
    }
    updates.name = patch.name.trim();
  }

  // 4. עדכון מיקום (parentId) ומניעת מחזוריות
  if (patch.parentId !== undefined) {
    const newParentId = patch.parentId ?? null;
    if (newParentId === id) {
      const err = new Error('parentId cannot be the same as id');
      err.status = 400;
      throw err;
    }

    if (newParentId !== null) {
      const parent = fileRepository.findById(newParentId);
      if (!parent || parent.type !== 'folder') {
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

  // שמירה סופית ב-Repository והחזרת האובייקט המעודכן
  const updated = fileRepository.update(id, updates);
  return updated;
};

// --- Trash core ---

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

  // ✅ Folder: trash -> whole subtree, restore -> only folder itself (rest stays in trash)
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

    // ✅ restore: if parent is missing / not a folder / still trashed -> move to root permanently
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

const listTrash = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: true });
  return all.filter(i => i.trashed === true);
};

// DELETE becomes "move to trash"
const deleteItem = async (userId, id) => {
  await setTrashed(userId, id, true);
  return { id };
};

/**
 * DELETE FOREVER (per-user):
 * - Owner: physical delete + remove from repository
 * - Not owner: remove from user's trash, add to blockedBy AND revoke permission
 */
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

    const blockedBy = ensureArray(item.blockedBy);
    if (!blockedBy.includes(userId)) {
      fileRepository.update(id, { blockedBy: [...blockedBy, userId] });
    }

    const filePermissions = permissionRepository.findByFileId(id);
    const myPermission = filePermissions.find(p => p.userId === userId);

    if (myPermission) {
      permissionRepository.remove(myPermission.id);
    }

    return { id };
  }

  const ids = item.type === 'folder' ? collectSubtreeIds(id).reverse() : [id];

  for (const dId of ids) {
    const target = fileRepository.findById(dId);
    if (!target) continue;

    if (target.type === 'file') {
      await sendTcpCommand(`DELETE ${dId}`).catch(() => { });
    }

    fileRepository.remove(dId);

    const allPerms = permissionRepository.findByFileId(dId);
    allPerms.forEach(p => permissionRepository.remove(p.id));
  }

  return { id };
};

/**
 * EMPTY TRASH (per-user):
 * - For every trashed item of this user:
 *   - If owner: hard delete forever (includes subtree for folders)
 *   - Else: remove from user's trash (and best-effort revoke permission)
 *
 * Important: process folders first (so we don't double-delete children).
 */
const emptyTrash = async (userId) => {
  // get full trash view (decorated)
  const trashedItems = await listTrash(userId);

  // work on raw items (by id) and de-duplicate
  const uniqueIds = Array.from(new Set(trashedItems.map(i => i.id)));

  // sort: folders first to avoid double work
  const items = uniqueIds
    .map(id => fileRepository.findById(id))
    .filter(Boolean)
    .sort((a, b) => (a.type === 'folder' && b.type !== 'folder' ? -1 : a.type !== 'folder' && b.type === 'folder' ? 1 : 0));

  for (const it of items) {
    // guard: might already be deleted as part of a folder subtree
    const stillThere = fileRepository.findById(it.id);
    if (!stillThere) continue;

    // only act if still trashed for this user
    if (!isTrashedForUser(stillThere, userId)) continue;

    await deleteForever(userId, stillThere.id);
  }

  return { ok: true };
};

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

const setStarred = async (userId, id, starred) => setUserFlag(userId, id, 'starredBy', starred);
const setImportant = async (userId, id, important) => setUserFlag(userId, id, 'importantBy', important);

const listStarred = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });
  return all.filter(i => i.starred === true);
};

const listImportant = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });
  return all.filter(i => i.important === true);
};

const searchItems = async (userId, query) => {
  const nameMatches = fileRepository.searchFiles(userId, query).filter(f => !isTrashedForUser(f, userId));

  let contentMatchIds = [];
  try {
    const response = await sendTcpCommand(`SEARCH ${query}`);
    if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0);
  } catch (err) { }

  const contentMatches = contentMatchIds
    .map(id => fileRepository.findById(id))
    .filter(f => f && !isTrashedForUser(f, userId));

  const all = [...nameMatches, ...contentMatches];
  const unique = Array.from(new Map(all.map(i => [i.id, i])).values());
  return decorateListForUser(unique, userId).filter(i => !i.trashed);
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

const updateAccessTime = async (userId, id) => {
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

  const lastAccessedBy = item.lastAccessedBy && typeof item.lastAccessedBy === "object"
    ? { ...item.lastAccessedBy }
    : {};

  lastAccessedBy[userId] = nowIso();

  const updated = fileRepository.update(id, { lastAccessedBy });
  return decorateFlagsForUser(updated, userId);
};

const listRecent = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });

  const withAccess = all
    .filter(item => item.type === "file" && item.lastAccessed);

  withAccess.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));

  return withAccess.slice(0, 20);
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

  updateAccessTime,
  listRecent
};