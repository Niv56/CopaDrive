const permissionRepository = require('../repositories/permissionRepository');
const fileRepository = require('../repositories/fileRepository');
const userRepository = require('../repositories/userRepository');
const { generateId } = require('../utils/idGenerator');


const verifyOwnership = (ownerId, fileId) => {
    const file = fileRepository.findById(fileId, ownerId);
    if (!file) {
        const err = new Error('File not found or access denied');
        err.status = 404;
        throw err;
    }
    return file;
};


const resolveRole = (userId, fileId) => {
    let currentId = fileId;
    let found = null;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId); // ✅ בלי ownerId
        if (!item) break;

        if (item.ownerId === userId) return "owner";

        const perms = permissionRepository.findByFileId(currentId) || [];
        const userPerm = perms.find(p => p.userId === userId);

        if (userPerm) {
            if (userPerm.role === "editor") return "editor";
            if (!found) found = "viewer";
        }

        currentId = item.parentId;
    }

    return found;
};


exports.getPermissions = (requesterId, fileId) => {
    // ✅ תיקון: אפשר לכל משתמש עם גישה (לפחות viewer) לראות את כל רשימת ההרשאות
    const role = resolveRole(requesterId, fileId);
    if (!role) {
        const err = new Error('File not found or access denied');
        err.status = 404; // keep same behavior you had
        throw err;
    }

    // ✅ שליפת כל ההרשאות - כולל הרשאות שעוברות בירושה מתיקיות אב
    const allPermissions = new Map(); // userId -> permission (to avoid duplicates)

    // התחל מהקובץ הנוכחי ועלה עד השורש
    let currentId = fileId;
    while (currentId !== null) {
        const item = fileRepository.findById(currentId);
        if (!item) break;

        // שלוף את ההרשאות של הרמה הנוכחית
        const perms = permissionRepository.findByFileId(currentId) || [];

        // הוסף רק הרשאות שעוד לא ראינו (ההרשאות הכי קרובות לקובץ מנצחות)
        for (const perm of perms) {
            if (!allPermissions.has(perm.userId)) {
                allPermissions.set(perm.userId, perm);
            }
        }

        currentId = item.parentId;
    }

    // המר את ה-Map חזרה למערך
    const permissions = Array.from(allPermissions.values());

    // ✅ שלוף את blockedBy מהקובץ (כדי שה-Frontend יוכל לסנן)
    const file = fileRepository.findById(fileId);
    const blockedBy = file?.blockedBy && Array.isArray(file.blockedBy) ? file.blockedBy : [];

    // return: list + myRole + blockedBy
    return { myRole: role, permissions, blockedBy };
};

// Add a new permission entry
exports.addPermission = (ownerId, fileId, payload) => {
    verifyOwnership(ownerId, fileId);

    // Validate that the target user exists
    const targetUser = userRepository.findById(payload.userId);
    if (!targetUser) {
        const err = new Error('User to grant permission to not found');
        err.status = 404;
        throw err;
    }

    // ✅ Unblock user if they were blocked (allow re-sharing)
    const file = fileRepository.findById(fileId);
    if (file && file.blockedBy && Array.isArray(file.blockedBy)) {
        const blockedBy = file.blockedBy.filter(uid => uid !== payload.userId);
        if (blockedBy.length !== file.blockedBy.length) {
            // User was blocked, unblock them
            fileRepository.update(fileId, { blockedBy });
        }
    }

    // Check for duplicates
    const existingPermissions = permissionRepository.findByFileId(fileId);
    const duplicate = existingPermissions.find(p => p.userId === payload.userId);

    if (duplicate) {
        const err = new Error('Permission already exists for this user');
        err.status = 409;
        throw err;
    }

    const newPermission = {
        id: generateId((id) => permissionRepository.findById(id)),
        fileId: fileId,
        userId: payload.userId,
        role: 'viewer'
    };

    return permissionRepository.create(newPermission);
};


// Update an existing permission entry 
exports.updatePermission = (ownerId, fileId, pId) => {
    verifyOwnership(ownerId, fileId);
    const permission = permissionRepository.findById(pId);

    if (!permission || permission.fileId !== fileId) {
        const error = new Error('Permission not found');
        error.status = 404;
        throw error;
    }

    const newRole = (permission.role === 'viewer') ? 'editor' : 'viewer';

    return permissionRepository.update(pId, { role: newRole });
};

// Delete a permission entry
exports.deletePermission = (ownerId, fileId, pId) => {
    verifyOwnership(ownerId, fileId);

    const removed = permissionRepository.remove(pId);
    if (!removed) {
        const err = new Error('Permission not found');
        err.status = 404;
        throw err;
    }
    return removed;
};

const checkAccess = (userId, fileId, requiredRole = 'viewer') => {
    let currentId = fileId;
    let foundPermission = null;

    while (currentId !== null) {
        const item = fileRepository.findById(currentId, userId); // ✅ תיקון
        if (!item) break;

        if (item.ownerId === userId) return true;

        const permissions = permissionRepository.findByFileId(currentId) || [];
        const userPerm = permissions.find(p => p.userId === userId);

        if (userPerm) {
            if (userPerm.role === 'editor') return true;
            if (!foundPermission) foundPermission = userPerm.role;
        }

        currentId = item.parentId;
    }

    if (requiredRole === 'viewer') return foundPermission !== null;
    if (requiredRole === 'editor') return foundPermission === 'editor';
    return false;
};