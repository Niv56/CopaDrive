const permissionService = require('../services/permissionService');
const { validateFields } = require('../utils/validation');

// Adds a new permission for a file
exports.addPermission = async (req, res, next) => { 
    try {
        validateFields(req.body, ['userId']);

        const ownerId = req.user.id;
        const fileId = req.params.id;
        const { userId, role = "viewer" } = req.body; 

        const created = await permissionService.addPermission(ownerId, fileId, userId, role);
        
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

// Lists all permissions for a specific file
exports.getPermissions = async (req, res, next) => { 
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;

        const permissions = await permissionService.getPermissions(ownerId, fileId);
        res.status(200).json(permissions);
    } catch (err) {
        next(err);
    }
};

// Updates an existing permission role
exports.updatePermission = async (req, res, next) => { 
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        const pId = req.params.pId; 
        const { role } = req.body;  

        const updated = await permissionService.updatePermission(ownerId, fileId, pId, role);

        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// Removes a permission from a file
exports.deletePermission = async (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        const pId = req.params.pId;

        await permissionService.deletePermission(ownerId, fileId, pId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};