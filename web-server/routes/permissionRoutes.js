const express = require('express');
const router = express.Router({ mergeParams: true });
const permissionController = require('../controllers/permissionController');
const { requireAuth } = require('../middleware/authMiddleware');


// All routes start with /api/files/:id/permissions
// GET /api/files/:id/permissions - Get all permissions for a specific file/folder by its ID
router.get('/', requireAuth, permissionController.getPermissions);

// POST /api/files/:id/permissions - Grant a new permission for a specific file/folder
router.post('/', requireAuth, permissionController.addPermission);

// PATCH /api/files/:id/permissions/:pId - Update an existing permission by its permission ID (pId)
router.patch('/:pId', requireAuth, permissionController.updatePermission);

// DELETE /api/files/:id/permissions/:pId - Revoke/Delete a specific permission by its pId
router.delete('/:pId', requireAuth, permissionController.deletePermission);

module.exports = router;