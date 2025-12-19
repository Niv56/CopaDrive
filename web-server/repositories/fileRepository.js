/**
 * Implement Files Repository Methods.
 * Handles in-memory data operations for files and directories.
 */
const { files } = require('../services/userService'); // Accessing the file store

// Find files by their parent directory ID to support listing
const findByParent = (parentId) => files.filter(f => f.parentId === parentId);

// Find a specific file/folder by ID
const findById = (id) => files.find(f => f.id === id);

// Add a new file/folder entry to the store
const create = (fileData) => {
    files.push(fileData);
    return fileData;
};

// Remove a file/folder by ID
const remove = (id) => {
    const index = files.findIndex(f => f.id === id);
    if (index !== -1) return files.splice(index, 1)[0];
    return null;
};

module.exports = {
    findByParent,
    findById,
    create,
    remove
};