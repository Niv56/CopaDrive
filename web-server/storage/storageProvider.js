// web-server/storage/storageProvider.js

const store = require('../utils/storage');

/**
 * Returns the active storage provider.
 * For now we use an in-memory store (users/files/permissions).
 */
function getProvider() {
  return { name: 'in-memory', store };
}

module.exports = { getProvider };
