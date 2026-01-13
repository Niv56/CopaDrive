const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// All routes start with /api/files

// List
router.get('/', requireAuth, fileController.listAll);

// MUST be before "/:id"
router.get('/usage', requireAuth, fileController.getUsage);

router.get('/starred', requireAuth, fileController.listStarred);
router.get('/important', requireAuth, fileController.listImportant);

// ✅ Trash routes (must be before "/:id")
router.get('/trash', requireAuth, fileController.listTrash);

// ✅ Empty trash (support both)
router.delete('/trash/empty', requireAuth, fileController.emptyTrash);
router.delete('/trash', requireAuth, fileController.emptyTrash);

// ✅ Recent + access (must be before "/:id")
router.get('/recent', requireAuth, fileController.listRecent);
router.patch('/:id/access', requireAuth, fileController.recordAccess);

// Create
router.post('/', requireAuth, fileController.createItem);

// ✅ Delete forever (permanent)
router.delete('/:id/forever', requireAuth, fileController.deleteForever);

// Read by id
router.get('/:id', requireAuth, fileController.getById);

// Flags
router.patch('/:id/star', requireAuth, fileController.setStarred);
router.patch('/:id/important', requireAuth, fileController.setImportant);

// ✅ set/unset trash
router.patch('/:id/trash', requireAuth, fileController.setTrashed);

// Update
router.patch('/:id', requireAuth, fileController.updateItem);

// DELETE now means "move to trash"
router.delete('/:id', requireAuth, fileController.deleteItem);

// Permissions
router.use('/:id/permissions', requireAuth, permissionRoutes);

module.exports = router;
