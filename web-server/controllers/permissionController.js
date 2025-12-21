
// Handles HTTP requests related to file/folder access permissions.
const permissionService = require('../services/permissionService');
const { validateFields } = require('../utils/validation');


 // POST /api/files/:id/permissions - Handle adding a new permission
exports.addPermission = (req, res, next) => {
    try {
        // Ensure the userId of the person receiving access is provided
        validateFields(req.body, ['userId']);

        const ownerId = req.user.id;
        const fileId = req.params.id;
        const role = "viewer"

        const created = permissionService.addPermission(ownerId, fileId, req.body, role);
        res.status(201).json(created); // 201 Created as required
    } catch (err) {
        next(err);
    }
};

 
 // GET /api/files/:id/permissions - Handle listing all permissions for a file
 
exports.getPermissions = (req, res, next) => {
    try {
        // User ID from authMiddleware
        const ownerId = req.user.id; 
        // File ID from URL
        const fileId = req.params.id; 

        const permissions = permissionService.getPermissions(ownerId, fileId);
        res.status(200).json(permissions);
    } catch (err) {
        // Global error handler
        next(err); 
    }
};

// PATCH /api/files/:id/permissions/:pId
exports.updatePermission = (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        const pId = req.params.pId;

        // Send request to updatePermission to change the permission
        const updated = permissionService.updatePermission(ownerId, fileId, pId);
        
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

  

// DELETE /api/files/:id/permissions/:pId - Handle deleting a permission
exports.deletePermission = (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const fileId = req.params.id;
        // The specific permission ID to remove
        const pId = req.params.pId; 

        permissionService.deletePermission(ownerId, fileId, pId);
        // 204 No Content as required
        res.status(204).end(); 
    } catch (err) {
        next(err);
    }
};