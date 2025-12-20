//service
// Initialize In-Memory Store. 
// Volatile in-memory storage. Resets on server restart.
const users = []; // Array to store user objects
const files = []; // Array to store file metadata

module.exports = {
    users,
    files
};