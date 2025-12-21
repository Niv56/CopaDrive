const fileRepository = require('../repositories/fileRepository');
const { generateId } = require('../utils/idGenerator');

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';


const wouldCreateCycle = (itemId, newParentId, ownerId) => {
  let cursor = newParentId ?? null;

  while (cursor !== null) {
    if (cursor === itemId) return true;

    const node = fileRepository.findById(cursor, ownerId);
    if (!node) return false; // safety: parent missing => no cycle decision here

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

const listTopLevel = (ownerId) => {
  return fileRepository.findByParent(null, ownerId);
};

const createItem = (ownerId, payload) => {
  const name = payload?.name;
  const type = payload?.type;
  const parentId = payload?.parentId ?? null;

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

  // Validate parent folder if provided
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

  const ts = nowIso();
  const item = {
    id: generateId(),
    name: name.trim(),
    type,
    ownerId,
    parentId,
    createdAt: ts,
    updatedAt: ts
  };

  return fileRepository.create(item);
};

const getById = (ownerId, id) => {
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }
  return item;
};

const updateItem = (ownerId, id, patch) => {
  if (!patch || typeof patch !== 'object') {
    const err = new Error('Invalid JSON body');
    err.status = 400;
    throw err;
  }

  // Disallow type updates
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

    // Prevent setting itself as parent
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
      // Only relevant when moving a folder
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId, ownerId)) {
        const err = new Error('Cannot move a folder into its own descendant');
        err.status = 409; // Bad Request (as requested)
        throw err;
      }
    }

    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();

  const updated = fileRepository.update(id, updates, ownerId);
  return updated;
};

const deleteItem = (ownerId, id) => {
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  //  Recursive delete (folder/file)
  const idsToDelete = collectSubtreeIds(ownerId, id);

  // Delete children first, then the parent
  for (const deleteId of idsToDelete.reverse()) {
    fileRepository.remove(deleteId, ownerId);
  }
};

module.exports = {
  listTopLevel,
  createItem,
  getById,
  updateItem,
  deleteItem
};