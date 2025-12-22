// Volatile in-memory storage. Resets on server restart
const users = [];
const files = [];
const permissions = [];

module.exports = {
    users,
    files,
    permissions
}