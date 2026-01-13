const express = require('express');
const router = express.Router({ mergeParams: true });
const permissionController = require('../controllers/permissionController');
const { requireAuth } = require('../middleware/authMiddleware');

// Routes under /api/files/:id/permissions
router.get('/', requireAuth, permissionController.getPermissions);
router.post('/', requireAuth, permissionController.addPermission);
router.patch('/:pId', requireAuth, permissionController.updatePermission);
router.delete('/:pId', requireAuth, permissionController.deletePermission);

module.exports = router;
