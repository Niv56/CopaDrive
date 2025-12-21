/**
 * File Service
 * Business logic for file/folder listing and operations.
 * Integrates with C++ TCP Server for content storage.
 */

const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient');

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

const wouldCreateCycle = (itemId, newParentId, ownerId) => {
  let cursor = newParentId ?? null;

  while (cursor !== null) {
    if (cursor === itemId) return true;

    const node = fileRepository.findById(cursor, ownerId);
    if (!node) return false;

    cursor = node.parentId ?? null;
  }

  return false;
};

/**
 * Collect all descendant ids (including the root id) for recursive delete.
 * Uses a stack to avoid recursion depth issues.
 */
const collectSubtreeIds = (ownerId, rootId) => {
  const stack = [rootId];
  const visited = new Set();
  const ids = [];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    ids.push(currentId);

    const children = fileRepository.findByParent(currentId, ownerId) || [];
    for (const child of children) {
      stack.push(child.id);
    }
  }

  return ids;
};

const createItem = async (ownerId, payload) => {
  const name = payload?.name;
  const type = payload?.type;
  const parentId = payload?.parentId ?? null;
  const content = payload?.content || "";

  if (!name || typeof name !== 'string' || name.trim() === '') {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  if (!type || !assertValidType(type)) {
    const err = new Error('Type must be "file" or "folder"');
    err.status = 400;
    throw err;
  }

  // Validate parent folder if provided (must be an owned folder)
  if (parentId !== null) {
    const parent = fileRepository.findById(parentId, ownerId);
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
  }

  const id = generateId((id) => fileRepository.findById(id)); // Generate unique ID
  const ts = nowIso();

  if (type === 'file') {
    await sendTcpCommand(`POST ${id} ${content}`);
  }

  const item = {
    id,
    name: name.trim(),
    type,
    ownerId,
    parentId,
    createdAt: ts,
    updatedAt: ts
  };

  return fileRepository.create(item);
};

const getById = async (userId, id) => {
  const item = fileRepository.findById(id);

  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  const isOwner = item.ownerId === userId;
  const hasSharedAccess = (permissionRepository.findByFileId(id) || []).some(
    (p) => p.userId === userId
  );

  if (!isOwner && !hasSharedAccess) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  const result = { ...item };

  if (item.type === 'file') {
    try {
      const content = await sendTcpCommand(`GET ${id}`);
      result.content = content;
    } catch (err) {
      if (err.status === 404) result.content = "";
      else throw err;
    }
  }

  return result;
};

const updateItem = (ownerId, id, patch) => {
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

  const current = fileRepository.findById(id, ownerId);
  if (!current) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  const updates = {};

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
      const parent = fileRepository.findById(newParentId, ownerId);
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
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId, ownerId)) {
        const err = new Error('Cannot move a folder into its own descendant');
        err.status = 409;
        throw err;
      }
    }

    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();
  return fileRepository.update(id, updates, ownerId);
};

const deleteItem = async (ownerId, id) => {
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  const idsToDelete = collectSubtreeIds(ownerId, id);

  for (const deleteId of idsToDelete.reverse()) {
    const itemToDelete = fileRepository.findById(deleteId, ownerId);

    if (itemToDelete && itemToDelete.type === 'file') {
      try {
        await sendTcpCommand(`DELETE ${deleteId}`);
      } catch (err) {
        console.error(`Failed to delete physical file ${deleteId}:`, err.message);
      }
    }

    fileRepository.remove(deleteId, ownerId);
  }
};

const searchItems = async (ownerId, query) => {
  const nameMatches = fileRepository.searchFiles(ownerId, query);

  let contentMatchIds = [];
  try {
    const response = await sendTcpCommand(`SEARCH ${query}`);
    if (response) {
      contentMatchIds = response.split('\n').filter(line => line.length > 0);
    }
  } catch (err) {
    if (err.status !== 404) {
      console.error("Search error on C++ server:", err.message);
    }
  }

  const contentMatches = contentMatchIds
    .map(id => fileRepository.findById(id, ownerId))
    .filter(item => item !== undefined);

  const allMatches = [...nameMatches, ...contentMatches];
  return Array.from(new Map(allMatches.map(item => [item.id, item])).values());
};

/**
 * Fetch ALL owned items (entire tree) without requiring a new repository method.
 */
const getAllOwnedItems = (ownerId) => {
  const result = [];
  const visited = new Set();
  const stack = [null];

  while (stack.length > 0) {
    const parentId = stack.pop();
    const children = fileRepository.findByParent(parentId, ownerId) || [];

    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);

      result.push(child);

      if (child.type === 'folder') {
        stack.push(child.id);
      }
    }
  }

  return result;
};

/**
 * Fetch ALL items shared with the user.
 */
const getSharedWithMeFiles = (userId) => {
  const myPermissions = permissionRepository.findByUserId(userId) || [];
  if (myPermissions.length === 0) return [];

  const sharedFileIds = myPermissions.map(p => p.fileId);
  return fileRepository.findByIds(sharedFileIds) || [];
};

/**
 * Main listing: ALL accessible items for the user (owned + shared)
 */
const listAllFiles = (ownerId) => {
  const ownedFiles = getAllOwnedItems(ownerId);
  const sharedFiles = getSharedWithMeFiles(ownerId);

  const allFiles = [...ownedFiles, ...sharedFiles];

  return Array.from(new Map(allFiles.map(item => [item.id, item])).values());
};

module.exports = {
  listAllFiles,
  createItem,
  getById,
  updateItem,
  deleteItem,
  searchItems
};
