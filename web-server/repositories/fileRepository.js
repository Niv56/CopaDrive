const { files } = require('../utils/storage');

const normalizeParentId = (parentId) => (parentId === undefined ? null : parentId);

// Finds non-trashed files within a specific folder
const findByParent = (parentId, ownerId) => {
  const p = normalizeParentId(parentId);
  return files.filter(f => {
    if (f.trashed === true) return false;
    const fp = normalizeParentId(f.parentId);
    const parentMatch = fp === p;
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return parentMatch && ownerMatch;
  });
};

// Returns all files in storage
const findAll = () => files;

// Finds a file by ID (including trashed files)
const findById = (id, ownerId) => {
  if (!ownerId) return files.find(f => f.id === id);
  return files.find(f => f.id === id && f.ownerId === ownerId);
};

// Creates a new file entry
const create = (fileData) => {
  const newFileData = {
    trashed: false,
    trashedAt: null,
    originalParentId: null,
    ...fileData,
  };

  files.push(newFileData);
  return newFileData;
};

// Updates an existing file entry
const update = (id, updates, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;

  files[idx] = { ...files[idx], ...updates };
  return files[idx];
};

// Removes a file entry from storage
const remove = (id, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;
  return files.splice(idx, 1)[0];
};

// Checks if a folder contains any non-trashed files
const hasChildren = (parentId, ownerId) => {
  return files.some(f => {
    if (f.trashed === true) return false;
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return ownerMatch && (f.parentId ?? null) === parentId;
  });
};

// Searches for non-trashed files by name or content
const searchFiles = (userId, query) => {
  const normalizedQuery = query.toLowerCase();

  return files.filter(file =>
    file.ownerId === userId &&
    file.trashed !== true &&
    (
      file.name.toLowerCase().includes(normalizedQuery) ||
      (file.content && file.content.toLowerCase().includes(normalizedQuery))
    )
  );
};

// Finds all files marked as trashed for a specific user
const findTrashed = (ownerId) => {
  return files.filter(f => f.ownerId === ownerId && f.trashed === true);
};

// Finds multiple files by an array of IDs
const findByIds = (idsArray) => files.filter(f => idsArray.includes(f.id));

module.exports = {
  findByParent,
  findById,
  create,
  update,
  remove,
  hasChildren,
  searchFiles,
  findByIds,
  findAll,
  findTrashed,
};