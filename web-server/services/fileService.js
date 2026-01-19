const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { sendTcpCommand } = require('../utils/tcpClient');
const permissionService = require("./permissionService");

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

const TRASH_TTL_DAYS = 30;
const TRASH_TTL_MS = TRASH_TTL_DAYS * 24 * 60 * 60 * 1000;
const QUOTA_BYTES = 15 * 1024 * 1024 * 1024;

const ensureArray = (v) => Array.isArray(v) ? v : [];


const contentSizeBytes = (content) => {
  if (content === undefined || content === null) return 0;
  const s = typeof content === 'string' ? content : String(content);
  return Buffer.byteLength(s, 'utf8');
};

const calcDaysLeft = (trashedAt) => {
  if (!trashedAt) return null;
  const t = new Date(trashedAt).getTime();
  if (Number.isNaN(t)) return null;
  const expireAt = t + TRASH_TTL_MS;
  const msLeft = expireAt - Date.now();
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
};


const checkAccess = async (userId, fileId, requiredRole = 'viewer') => {
  console.log(`[DEBUG] checkAccess: userId=${userId}, fileId=${fileId}`);
  let currentId = fileId;
  let highestRoleFound = null;

  while (currentId !== null) {
    const item = await fileRepository.findById(currentId);
    if (!item) break;

    const blockedBy = ensureArray(item.blockedBy);
    if (blockedBy.some(id => id.toString() === userId.toString())) return false;

    if (item.ownerId.toString() === userId.toString()) return true;

    const permissions = await permissionRepository.findByFileId(currentId) || [];
    const userPerm = permissions.find(p => p.userId.toString() === userId.toString());

    if (userPerm) {
      if (userPerm.role === 'editor') return true;
      if (userPerm.role === 'viewer') highestRoleFound = 'viewer';
    }
    currentId = item.parentId;
  }
  return requiredRole === 'viewer' ? highestRoleFound !== null : false;
};

const isDescendant = async (fileId, folderId) => {
  let current = await fileRepository.findById(fileId);
  while (current && current.parentId) {
    if (current.parentId.toString() === folderId.toString()) return true;
    current = await fileRepository.findById(current.parentId);
  }
  return false;
};

const wouldCreateCycle = async (itemId, newParentId) => {
  let cursor = newParentId ?? null;
  while (cursor !== null) {
    if (cursor.toString() === itemId.toString()) return true;
    const node = await fileRepository.findById(cursor);
    if (!node) return false;
    cursor = node.parentId ?? null;
  }
  return false;
};

const collectSubtreeIds = async (rootId) => {
  const stack = [rootId];
  const visited = new Set();
  const ids = [];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (visited.has(currentId.toString())) continue;
    visited.add(currentId.toString());
    ids.push(currentId);
    
    const children = await fileRepository.findByParentIncludingTrashed(currentId) || [];
    for (const child of children) stack.push(child._id); 
  }
  return ids;
};


const decorateFlagsForUser = (item, userId) => {
  if (!item) return null;
  const i = item.toObject ? item.toObject() : { ...item };
  const uid = userId.toString();

  const starredBy = ensureArray(i.starredBy).map(id => id.toString());
  const importantBy = ensureArray(i.importantBy).map(id => id.toString());
  const trashedBy = ensureArray(i.trashedBy).map(id => id.toString());

  const trashed = trashedBy.includes(uid);
  const trashedAt = trashed ? (i.trashedAtBy?.[uid] || null) : null;

  const lastAccessedBy = i.lastAccessedBy || {};
  const lastAccessed = lastAccessedBy[uid] || null;

  return {
    ...i,
    starred: starredBy.includes(uid),
    important: importantBy.includes(uid),
    trashed,
    trashedAt,
    trashDaysLeft: trashed ? calcDaysLeft(trashedAt) : null,
    lastAccessed
  };
};

const decorateListForUser = (items, userId) => items.map(i => decorateFlagsForUser(i, userId));


const listAllAccessible = async (userId, { includeTrashed = false } = {}) => {
  const ownedItems = await fileRepository.findAllByOwner(userId);
  const userPermissions = await permissionRepository.findByUserId(userId) || [];

  const sharedItems = [];
  for (const perm of userPermissions) {
    const item = await fileRepository.findById(perm.fileId);
    if (item) sharedItems.push(item);
  }

  const all = [...ownedItems, ...sharedItems];
  const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
  const decorated = decorateListForUser(unique, userId);
  return includeTrashed ? decorated : decorated.filter(i => !i.trashed);
};


const createItem = async (ownerId, payload) => {
  const { name, type, parentId = null, content = "", mimeType = "" } = payload;

  if (!name?.trim()) throw { status: 400, message: 'Name is required' };
  if (!assertValidType(type)) throw { status: 400, message: 'Invalid type' };

  const newItemSize = type === 'file' ? contentSizeBytes(content) : 0;
  const storageUsage = await getOwnedStorageUsage(ownerId);  
  
  if (storageUsage.usedBytes + newItemSize > QUOTA_BYTES) {
    throw { 
      status: 403, 
      message: `Storage quota exceeded. Used: ${(storageUsage.usedBytes / (1024 ** 3)).toFixed(2)}GB / 15GB` 
    };
  }

  if (parentId && parentId !== 'root') {
    const parent = await fileRepository.findById(parentId);
    if (!parent || parent.type !== 'folder') throw { status: 400, message: 'Invalid parent' };
    if (!(await checkAccess(ownerId, parentId, 'editor'))) throw { status: 403, message: 'No permission to create here' };
  }

  const ts = nowIso();
  const created = await fileRepository.create({
    name: name.trim(),
    type,
    ownerId,
    parentId: (parentId === 'root' || !parentId) ? null : parentId,
    createdAt: ts,
    updatedAt: ts,
    sizeBytes: newItemSize,
    mimeType
  });

  if (type === 'file') {
    try {
      await sendTcpCommand(`POST ${created.id} ${content}`);
    } catch (err) {
      await fileRepository.remove(created.id, ownerId);
      throw err;
    }
  }

  try { 
    await permissionService.addPermission(ownerId, created.id, { userId: ownerId }, "owner");
  } catch (_) { }

  return created;
};

const updateItem = async (userId, id, patch) => {
  const current = await fileRepository.findById(id);
  if (!current) throw { status: 404, message: 'Not found' };
  if (!(await checkAccess(userId, id, 'editor'))) throw { status: 403, message: 'Editor access required' };

  const updates = {};

  if (patch.content !== undefined && current.type === 'file') {
    const newSize = contentSizeBytes(patch.content);
    const sizeDiff = newSize - (current.sizeBytes || 0);

    if (sizeDiff > 0) {
      const storageUsage = await module.exports.getOwnedStorageUsage(current.ownerId);
      if (storageUsage.usedBytes + sizeDiff > QUOTA_BYTES) {
        throw { status: 403, message: 'Quota exceeded' };
      }
    }

    await sendTcpCommand(`DELETE ${id}`).catch(() => { });
    await sendTcpCommand(`POST ${id} ${patch.content}`);
    updates.sizeBytes = newSize;
  }

  if (patch.name) updates.name = patch.name.trim();
  if (patch.mimeType) updates.mimeType = patch.mimeType;
  
  if (patch.parentId !== undefined) {
    const newParentId = (patch.parentId === 'root' || !patch.parentId) ? null : patch.parentId;
    if (newParentId && await wouldCreateCycle(id, newParentId)) throw { status: 409, message: 'Cycle detected' };
    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();
  const updated = await fileRepository.update(id, updates);
  return decorateFlagsForUser(updated, userId);
};

const setTrashed = async (userId, id, trashed) => {
  const item = await fileRepository.findById(id);
  if (!item) throw { status: 404, message: "Not found" };

  const ids = item.type === "folder" ? (trashed ? await collectSubtreeIds(id) : [id]) : [id];
  for (const tId of ids) {
    const target = await fileRepository.findById(tId);
    if (!target) continue;
    const uid = userId.toString();
    const cur = ensureArray(target.trashedBy).map(x => x.toString());
    let next = trashed ? [...new Set([...cur, uid])] : cur.filter(x => x !== uid);
    const trashedAtBy = { ...(target.trashedAtBy || {}) };
    if (trashed) trashedAtBy[uid] = nowIso(); else delete trashedAtBy[uid];
    await fileRepository.update(tId, { trashedBy: next, trashedAtBy });
  }
  return decorateFlagsForUser(await fileRepository.findById(id), userId);
};

const deleteForever = async (userId, id) => {
  const item = await fileRepository.findById(id);
  if (!item) return { id };

  if (item.ownerId.toString() !== userId.toString()) {
    await fileRepository.update(id, { $addToSet: { blockedBy: userId }, $pull: { trashedBy: userId } });
    return { id };
  }

  const ids = item.type === 'folder' ? (await collectSubtreeIds(id)).reverse() : [id];
  for (const dId of ids) {
    const target = await fileRepository.findById(dId);
    if (target?.type === 'file') await sendTcpCommand(`DELETE ${dId}`).catch(() => { });
    await fileRepository.remove(dId , userId);
  }
  return { id };
};

const setUserFlag = async (userId, id, flagKey, enabled) => {
  const update = enabled ? { $addToSet: { [flagKey]: userId } } : { $pull: { [flagKey]: userId } };
  const updated = await fileRepository.update(id, update);
  return decorateFlagsForUser(updated, userId);
};

module.exports = {
  listTopLevel: async (userId) => {
    const items = await fileRepository.findByParent(null, userId);
    return decorateListForUser(items, userId).filter(i => !i.trashed);
  },
  createItem,
  getById: async (userId, id) => {
    const item = await fileRepository.findById(id);
    if (!item) throw { status: 404, message: 'Not found' };
    if (!(await checkAccess(userId, id, 'viewer'))) throw { status: 403, message: 'Denied' };
    let content = "";
    if (item.type === 'file') content = await sendTcpCommand(`GET ${id}`).catch(() => "");
    return decorateFlagsForUser({ ...item.toObject(), content }, userId);
  },
  updateItem,
  deleteItem: async (userId, id) => setTrashed(userId, id, true),
  deleteForever,
  emptyTrash: async (userId) => {
    const trashed = (await listAllAccessible(userId, { includeTrashed: true })).filter(i => i.trashed);
    for (const item of trashed) await deleteForever(userId, item.id);
    return { ok: true };
  },
  searchItems: async (userId, query) => {
    const userPermissions = await permissionRepository.findByUserId(userId) || []; 
    const sharedIds = userPermissions.map(p => p.fileId);

    const nameMatches = await fileRepository.searchFiles(userId, sharedIds, query);

    let contentMatchIds = [];
    try {
      const response = await sendTcpCommand(`SEARCH ${query}`);
      if (response) contentMatchIds = response.split('\n').filter(l => l.length > 0); 
    } catch (_) { }

    const contentMatches = [];
    for (const cId of contentMatchIds) {
      const f = await fileRepository.findById(cId); 
      
      if (f && (f.ownerId.toString() === userId.toString() || sharedIds.some(id => id.toString() === f._id.toString()))) { 
        contentMatches.push(f);
      }
    }

    const combined = [...nameMatches, ...contentMatches]; 
    const unique = Array.from(new Map(combined.map(i => [i.id, i])).values()); 
    
    return decorateListForUser(unique, userId).filter(i => !i.trashed); 
  },
  updateAccessTime: async (userId, id) => {
    const update = { [`lastAccessedBy.${userId}`]: nowIso() };
    const updated = await fileRepository.update(id, update);
    return decorateFlagsForUser(updated, userId);
  },
  listRecent: async (userId) => {
    const all = await listAllAccessible(userId);
    const withAccess = all.filter(i => i.type === 'file' && i.lastAccessed);
    return withAccess.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)).slice(0, 20);
  }
};

const getOwnedStorageUsage = async (userId) => {
  const items = await fileRepository.findAllByOwner(userId);
  const usedBytes = items.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
  return { usedBytes };
};