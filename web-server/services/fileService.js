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
const QUOTA_BYTES = 15 * 1024 * 1024 * 1024;

const ensureArray = (v) => Array.isArray(v) ? v : [];

const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
  let currentId = fileId;
  let highestRoleFound = null;

  while (currentId !== null) {
    const item = fileRepository.findById(currentId);
    if (!item) break;

    const blockedBy = ensureArray(item.blockedBy);
    if (blockedBy.includes(userId)) return false;

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
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
};

const decorateFlagsForUser = (item, userId) => {
  const starredBy = ensureArray(item.starredBy);
  const importantBy = ensureArray(item.importantBy);
  const trashedBy = ensureArray(item.trashedBy);

  const trashed = trashedBy.includes(userId);
  const trashedAt = trashed ? getTrashedAtForUser(item, userId) : null;

  const lastAccessedBy = (item.lastAccessedBy && typeof item.lastAccessedBy === 'object')
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

const isTrashedForUser = (item, userId) => ensureArray(item?.trashedBy).includes(userId);

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
  const sharedRoots = userPermissions.map(perm => fileRepository.findById(perm.fileId)).filter(Boolean);

  const roots = [...ownedRoots];
  for (const item of sharedRoots) {
    const already = roots.some(r => r.id === item.id);
    const hasAncestorInShared = sharedRoots.some(other => other.id !== item.id && isDescendant(item.id, other.id));
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

const listTopLevel = async (userId) => listAllAccessible(userId, { includeTrashed: false });

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
  const { name, type, parentId = null, content = "", mimeType = "" } = payload;

  if (!name || typeof name !== 'string' || name.trim() === '') throw { status: 400, message: 'Name is required' };
  if (!type || !assertValidType(type)) throw { status: 400, message: 'Invalid type' };

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

  return created;
};

const updateItem = async (userId, id, patch) => {
  if (!patch || typeof patch !== 'object') throw { status: 400, message: 'Invalid JSON body' };
  if (patch.type !== undefined) throw { status: 400, message: 'Type cannot be updated' };

  const current = fileRepository.findById(id);
  if (!current) throw { status: 404, message: 'File or folder not found' };
  if (!(await checkAccess(userId, id, 'editor'))) throw { status: 403, message: 'Editor access required' };

  const updates = {};

  if (patch.content !== undefined) {
    if (current.type === 'folder') throw { status: 400, message: 'Cannot update content of a folder' };
    try {
      try { await sendTcpCommand(`DELETE ${id}`); } catch (e) { }
      await sendTcpCommand(`POST ${id} ${patch.content}`);
      updates.sizeBytes = contentSizeBytes(patch.content);
    } catch (err) { throw err; }
  }

  if (patch.mimeType !== undefined) updates.mimeType = patch.mimeType;

  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (trimmed === '') throw { status: 400, message: 'Name must be a non-empty string' };
    updates.name = trimmed;
  }

  if (patch.parentId !== undefined) {
    const newParentId = patch.parentId ?? null;
    if (newParentId === id) throw { status: 400, message: 'parentId cannot be the same as id' };

    if (newParentId !== null) {
      const parent = fileRepository.findById(newParentId);
      if (!parent || parent.type !== 'folder') throw { status: 400, message: 'Parent must be a folder' };
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId)) {
        throw { status: 409, message: 'Cannot move a folder into its own descendant' };
      }
    }
    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();
  return fileRepository.update(id, updates);
};

const setTrashed = async (userId, id, trashed) => {
  const item = fileRepository.findById(id);
  if (!item) throw { status: 404, message: "File or folder not found" };
  if (!(await checkAccess(userId, id, "viewer"))) throw { status: 403, message: "Access denied" };

  const ids = item.type === "folder" ? (trashed ? collectSubtreeIds(id) : [id]) : [id];
  for (const tId of ids) {
    const target = fileRepository.findById(tId);
    if (!target) continue;
    const cur = ensureArray(target.trashedBy);
    let next = trashed ? [...new Set([...cur, userId])] : cur.filter(x => x !== userId);
    const trashedAtBy = { ...(target.trashedAtBy || {}) };
    if (trashed) { if (!trashedAtBy[userId]) trashedAtBy[userId] = nowIso(); } else { delete trashedAtBy[userId]; }
    fileRepository.update(tId, { trashedBy: next, trashedAtBy });
  }
  return decorateFlagsForUser(fileRepository.findById(id), userId);
};

const listTrash = async (userId) => (await listAllAccessible(userId, { includeTrashed: true })).filter(i => i.trashed);

const deleteItem = async (userId, id) => {
  await setTrashed(userId, id, true);
  return { id };
};

const deleteForever = async (userId, id) => {
  const item = fileRepository.findById(id);

  if (!item) return { id };

  if (!isTrashedForUser(item, userId)) {
    throw { status: 409, message: 'Item not found in your trash' };
  }

  if (item.ownerId !== userId) {
    const ids = item.type === 'folder' ? collectSubtreeIds(id) : [id];

    for (const dId of ids) {
      const target = fileRepository.findById(dId);
      if (!target) continue;

      const trashedBy = ensureArray(target.trashedBy).filter(x => x !== userId);
      const trashedAtBy = { ...(target.trashedAtBy || {}) };
      delete trashedAtBy[userId];

      const blockedBy = [...new Set([...ensureArray(target.blockedBy), userId])];

      fileRepository.update(dId, { trashedBy, trashedAtBy, blockedBy });

      const myPermission = (permissionRepository.findByFileId(dId) || []).find(p => p.userId === userId);
      if (myPermission) {
        permissionRepository.remove(myPermission.id);
      }
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

    const allPerms = permissionRepository.findByFileId(dId) || [];
    allPerms.forEach(p => permissionRepository.remove(p.id));
  }
  return { id };
};

const emptyTrash = async (userId) => {
  const items = await listTrash(userId);

  for (const it of items) {
    try {
      await deleteForever(userId, it.id);
    } catch (err) {
      console.error(`Failed to delete item ${it.id} during empty trash:`, err.message);
    }
  }
  return { ok: true };
};

const setUserFlag = async (userId, id, flagKey, enabled) => {
  const item = fileRepository.findById(id);
  if (!item) throw { status: 404, message: 'Not found' };
  const current = ensureArray(item[flagKey]);
  let next = enabled ? [...new Set([...current, userId])] : current.filter(x => x !== userId);
  const updated = fileRepository.update(id, { [flagKey]: next });
  return decorateFlagsForUser(updated, userId);
};

const updateAccessTime = async (userId, id) => {
  const item = fileRepository.findById(id);
  if (!item) throw { status: 404, message: "File or folder not found" };

  if (!(await checkAccess(userId, id, "viewer"))) {
    throw { status: 403, message: "Access denied" };
  }

  const lastAccessedBy = (item.lastAccessedBy && typeof item.lastAccessedBy === "object")
    ? { ...item.lastAccessedBy }
    : {};

  lastAccessedBy[userId] = nowIso();
  const updated = fileRepository.update(id, { lastAccessedBy });
  return decorateFlagsForUser(updated, userId);
};

const listRecent = async (userId) => {
  const all = await listAllAccessible(userId, { includeTrashed: false });
  const withAccess = all.filter(item => item.type === "file" && item.lastAccessed);
  withAccess.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
  return withAccess.slice(0, 20);
};

const getOwnedStorageUsage = async (userId) => {
  const ownedFiles = fileRepository.findAll().filter(f => f.ownerId === userId && f.type === 'file');
  const usedBytes = ownedFiles.reduce((sum, f) => sum + (typeof f.sizeBytes === 'number' ? f.sizeBytes : 0), 0);
  const percent = QUOTA_BYTES > 0 ? usedBytes / QUOTA_BYTES : 0;

  return { usedBytes, quotaBytes: QUOTA_BYTES, percent };
};

module.exports = {
  listTopLevel,
  createItem,
  getById,
  updateItem,
  deleteItem,
  deleteForever,
  emptyTrash,

  searchItems: async (userId, query) => {
    const nameMatches = fileRepository.searchFiles(userId, query).filter(f => !isTrashedForUser(f, userId));
    let contentMatchIds = [];
    try {
      const response = await sendTcpCommand(`SEARCH ${query}`);
      if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0);
    } catch (_) { }

    const contentMatches = contentMatchIds.map(id => fileRepository.findById(id)).filter(f => f && !isTrashedForUser(f, userId));
    const unique = Array.from(new Map([...nameMatches, ...contentMatches].map(i => [i.id, i])).values());
    return decorateListForUser(unique, userId).filter(i => !i.trashed);
  },

  setStarred: async (userId, id, starred) => setUserFlag(userId, id, 'starredBy', starred),
  setImportant: async (userId, id, important) => setUserFlag(userId, id, 'importantBy', important),
  listStarred: async (userId) => (await listAllAccessible(userId, { includeTrashed: false })).filter(i => i.starred),
  listImportant: async (userId) => (await listAllAccessible(userId, { includeTrashed: false })).filter(i => i.important),

  setTrashed,
  listTrash,
  getOwnedStorageUsage,
  updateAccessTime,
  listRecent
};