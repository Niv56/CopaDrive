/**
 * File Service
 * Business logic for file/folder listing and operations.
 * Integrates with C++ TCP Server for content storage.
 */
const fileRepository = require('../repositories/fileRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient'); // Import the TCP Client

const nowIso = () => new Date().toISOString();
const assertValidType = (type) => type === 'file' || type === 'folder';

/**
 * Cycle protection:
 * Returns true if moving `itemId` under `newParentId` would create a cycle.
 * We detect cycles by walking up from newParentId to the root and checking if we hit itemId.
 */
const wouldCreateCycle = (itemId, newParentId, ownerId) => {
  let cursor = newParentId ?? null;

  while (cursor !== null) {
    if (cursor === itemId) return true;

    const node = fileRepository.findById(cursor, ownerId);
    if (!node) return false; // safety (shouldn't happen if parent is validated)

    cursor = node.parentId ?? null;
  }

  return false;
};

const listTopLevel = (ownerId) => {
  return fileRepository.findByParent(null, ownerId);
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

  const id = generateId(); // Generate unique ID
  const ts = nowIso();

  // If it is a file, store content in C++ server using the ID as the filename
  if (type === 'file') {
      try {
        // Command format: POST <id> <content>
        // We use 'id' instead of 'name' to allow multiple files with the same name
        await sendTcpCommand(`POST ${id} ${content}`);
      } catch (err) {
        throw err; // Propagate error (e.g., if C++ server is down)
      }
  }

  const item = {
    id, // Used as key in C++ storage
    name: name.trim(), // Visible name to user
    type,
    ownerId,
    parentId,
    createdAt: ts,
    updatedAt: ts
  };

  return fileRepository.create(item);
};

const getById = async (ownerId, id) => {
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // Clone item to avoid mutation of repo state
    const result = { ...item };

    if (item.type === 'file') {
        try {
            // Command format: GET <id>
            const content = await sendTcpCommand(`GET ${id}`);
            result.content = content; // Attach content to response
        } catch (err) {
            // If physical file is missing but metadata exists, we handle gracefully or throw
            if (err.status === 404) {
                result.content = ""; // Fallback or handle as error
            } else {
                throw err;
            }
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

      // ✅ Block cycles only when moving a folder
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId, ownerId)) {
        const err = new Error('Cannot move a folder into its own descendant');
        err.status = 409; // Conflict
        throw err;
      }
    }

    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();

  const updated = fileRepository.update(id, updates, ownerId);
  return updated; // cannot be null here
};

const deleteItem = async (ownerId, id) => {
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // Block deleting folder if it has children
  if (item.type === 'folder' && fileRepository.hasChildren(item.id, ownerId)) {
    const err = new Error('Folder is not empty');
    err.status = 409;
    throw err;
  }

  if (item.type === 'file') {
    try {
      // Command format: DELETE <id>
      await sendTcpCommand(`DELETE ${id}`);
    } catch (err) {
      console.error(`Failed to delete physical file ${id}:`, err.message);
      // We proceed to delete metadata even if physical delete fails (or handle otherwise)
    }
  }

  fileRepository.remove(id, ownerId);
};

/**
 * Searches for files by Name (NodeJS) or Content (C++).
 * Map search to TCP SEARCH
 */
const searchItems = async (ownerId, query) => {
    // Search by Name (In-Memory Metadata)
    const nameMatches = fileRepository.searchFiles(ownerId, query);

    // Search by Content (TCP Request to C++)
    // Returns a list of ID's (because we stored them by ID)
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

    // Merge Results
    // Convert contentMatchIds to actual file objects
    const contentMatches = contentMatchIds
      .map(id => fileRepository.findById(id, ownerId))
      .filter(item => item !== undefined); // Filter out if ID doesn't belong to this user

    // Combine arrays and remove duplicates (by ID)
    const allMatches = [...nameMatches, ...contentMatches];
    
    // Deduplicate based on unique ID
    const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.id, item])).values());

    return uniqueMatches;
};

module.exports = {
  listTopLevel,
  createItem,
  getById,
  updateItem,
  deleteItem,
  searchItems
};
