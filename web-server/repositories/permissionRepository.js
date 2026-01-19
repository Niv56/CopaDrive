const Permission = require('../models/permission'); 

// Find all permissions for a given file/folder id.
const findByFileId = async (fileId) => {
    return await Permission.find({ fileId });
};

// Find a permission entry by its id.
const findById = async (id) => {
    return await Permission.findById(id);
};

// Create a new permission entry.
const create = async (permissionData) => {
    // במונגו, create גם יוצר וגם שומר אוטומטית
    return await Permission.create(permissionData);
};

// Update an existing permission role.
const update = async (id, updates) => {
    // { new: true } מבטיח שנחזיר את האובייקט המעודכן ולא את הישן
    return await Permission.findByIdAndUpdate(id, updates, { new: true });
};

// Remove a permission entry by id.
const remove = async (id) => {
    return await Permission.findByIdAndDelete(id);
};

// Find all permissions for a given user id.
const findByUserId = async (userId) => {
    return await Permission.find({ userId });
};

module.exports = { findByFileId, findById, create, update, remove, findByUserId };