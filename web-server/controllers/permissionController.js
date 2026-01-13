const permissionService = require('../services/permissionService');
const { validateFields } = require('../utils/validation');

// Adds a new permission for a file
exports.addPermission = (req, res, next) => {
    try {
        validateFields(req.body, ['userId']);

        const ownerId = req.user.id;
        const fileId = req.params.id;
        const role = "viewer";

        const created = permissionService.addPermission(ownerId, fileId, req.body, role);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

// Lists all permissions for a specific file
exports.getPermissions = (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;

        const permissions = permissionService.getPermissions(ownerId, fileId);
        res.status(200).json(permissions);
    } catch (err) {
        next(err);
    }
};

// Updates an existing permission role
exports.updatePermission = (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        const pId = req.params.pId;

        const updated = permissionService.updatePermission(ownerId, fileId, pId);

        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// Removes a permission from a file
exports.deletePermission = (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        const pId = req.params.pId;

        permissionService.deletePermission(ownerId, fileId, pId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};