/**
 * File Service
 * Business logic for file/folder listing and operations.
 * Integrates with C++ TCP Server for content storage.
 */

const fileRepository = require('../repositories/fileRepository');
const permissionRepository = require('../repositories/permissionRepository');
const { generateId } = require('../utils/idGenerator');
const { sendTcpCommand } = require('../utils/tcpClient'); // Import the TCP Client


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

  const id = generateId((id) => fileRepository.findById(id)); // Generate unique ID
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



const getById = async (userId, id) => {
  // Fetch item by ID only 
  const item = fileRepository.findById(id); 

  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // Check if the user is the owner OR has a shared permission
  const isOwner = item.ownerId === userId;
  const hasSharedAccess = (permissionRepository.findByFileId(id) || []).some(p => p.userId === userId);

  if (!isOwner && !hasSharedAccess) {
    const err = new Error('Access denied');
   // Forbidden
    err.status = 403; 
    throw err;
  }

  // Clone item and proceed with content fetching
  const result = { ...item };
  if (item.type === 'file') {
    try {
      // Command format: GET <id>
      const content = await sendTcpCommand(`GET ${id}`);
      result.content = content;
    } catch (err) {
      if (err.status === 404) {
        result.content = ""; 
      } else {
        throw err;
      }
    }
  }
  return result;
};

const updateItem = async (ownerId, id, patch) => {
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

  // --- Handle Content Update ---
  if (patch.content !== undefined) {
      // Folder's content cannot be changed
      if (current.type === 'folder') {
          const err = new Error('Cannot update content of a folder');
          err.status = 400; 
          throw err;
      }

      // File's content can be changed
      if (current.type === 'file') {
          try {
              // WORKAROUND: The C++ TCP Server does not support 'UPDATE' or overwriting via POST.
              // To update content, we must:
              // 1. Delete the existing physical file.
              // 2. Create a new file with the new content using the SAME ID.

              // Step 1: Attempt to delete the old physical file
              try {
                  await sendTcpCommand(`DELETE ${id}`);
              } catch (deleteErr) {
                  // We suppress errors here (Soft Fail).
                  // If the file was missing on the server (sync issue), we still want to proceed
                  // and create the new content.
                  console.warn(`[Update] Physical delete failed for id ${id} (proceeding to create):`, deleteErr.message);
              }

              // Step 2: Post the new content reusing the existing ID
              await sendTcpCommand(`POST ${id} ${patch.content}`);

          } catch (err) {
              // If the POST fails, this is a critical error (e.g. server down, storage full).
              throw err; 
          }
      }
  }

  // --- Handle Name Update ---
  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim() === '') {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      throw err;
    }
    updates.name = patch.name.trim();
  }

  // --- Handle Move (ParentId) ---
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
      // Cycle detection (Only relevant when moving a folder)
      if (current.type === 'folder' && wouldCreateCycle(id, newParentId, ownerId)) {
        const err = new Error('Cannot move a folder into its own descendant');
        err.status = 409;
        throw err;
      }
    }

    updates.parentId = newParentId;
  }

  updates.updatedAt = nowIso();

  const updated = fileRepository.update(id, updates, ownerId);
  return updated;
};

const deleteItem = async (ownerId, id) => {
  // 1. Validate that the item exists
  const item = fileRepository.findById(id, ownerId);
  if (!item) {
    const err = new Error('File or folder not found');
    err.status = 404;
    throw err;
  }

  // 2. Collect all descendant IDs (recursive delete)
  // We need to delete all children before deleting the folder itself.
  const idsToDelete = collectSubtreeIds(ownerId, id);

  // 3. Iterate over all IDs to delete (reverse order: children first, then parent)
  for (const deleteId of idsToDelete.reverse()) {
    
    // Fetch item to check its type before deletion
    const itemToDelete = fileRepository.findById(deleteId, ownerId);

    // 4. If it's a file, delete physical content from C++ server
    // This logic comes from the TCP integration requirement
    if (itemToDelete && itemToDelete.type === 'file') {
      try {
        // Command format: DELETE <id>
        await sendTcpCommand(`DELETE ${deleteId}`);
      } catch (err) {
        console.error(`Failed to delete physical file ${deleteId}:`, err.message);
        // We proceed to delete metadata even if physical delete fails
        // to ensure the DB state remains consistent.
      }
    }

    // 5. Finally, remove metadata from memory (Logic from main branch)
    fileRepository.remove(deleteId, ownerId);
    return { id: id };
  }
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


 // Fetches only the files where the user is the owner.
const getOwnedFiles = (userId, parentId = null) => {
    return fileRepository.findByParent(parentId, userId) || [];
};

 //Fetches files where the user was granted permission by someone else.
const getSharedWithMeFiles = (userId) => {
    // Look up permissions assigned to this specific user
    const myPermissions = permissionRepository.findByUserId(userId) || [];
    if (myPermissions.length === 0) return [];

    // Map the permissions to get the actual file objects
    const sharedFileIds = myPermissions.map(p => p.fileId);
    return fileRepository.findByIds(sharedFileIds) || [];
};

// Combines owned items (at Root) and all shared items into a single list
const listAllFiles = (ownerId) => {
    const ownedFiles = getOwnedFiles(ownerId, null);
    const sharedFiles = getSharedWithMeFiles(ownerId);

    // Merge both arrays
    const allFiles = [...ownedFiles, ...sharedFiles];
    
    // Safety check: Remove duplicates by ID using a Map
    return Array.from(new Map(allFiles.map(item => [item.id, item])).values());
};


module.exports = {
  listTopLevel,
  listAllFiles,
  createItem,
  getById,
  updateItem,
  deleteItem,
  searchItems
};

