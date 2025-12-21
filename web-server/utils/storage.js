//service
// Initialize In-Memory Store. 
// Volatile in-memory storage. Resets on server restart.
const users = []; // Array to store user objects
const files = []; // Array to store file metadata
const permissions = []; // Array to store list of permissions

module.exports = {
    users,
    files,
    permissions
}