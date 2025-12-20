/**
 * Implement Files Repository Methods.
 * Handles in-memory data operations for files and directories.
 */
const { files } = require('../services/userService');

const normalizeParentId = (parentId) => (parentId === undefined ? null : parentId);

const findByParent = (parentId, ownerId) => {
  const p = normalizeParentId(parentId);
  return files.filter(f => {
    const fp = normalizeParentId(f.parentId);
    const parentMatch = fp === p;
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return parentMatch && ownerMatch;
  });
};

const findById = (id, ownerId) => {
  if (!ownerId) return files.find(f => f.id === id);
  return files.find(f => f.id === id && f.ownerId === ownerId);
};

const create = (fileData) => {
  files.push(fileData);
  return fileData;
};

const update = (id, updates, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;

  files[idx] = { ...files[idx], ...updates };
  return files[idx];
};

const remove = (id, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;
  return files.splice(idx, 1)[0];
};

const hasChildren = (parentId, ownerId) => {
  return files.some(f => {
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return ownerMatch && (f.parentId ?? null) === parentId;
  });
};

module.exports = {
  findByParent,
  findById,
  create,
  update,
  remove,
  hasChildren
};
