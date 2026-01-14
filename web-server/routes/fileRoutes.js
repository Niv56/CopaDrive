const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// Basic list and storage stats
router.get('/', requireAuth, fileController.listAll);
router.get('/usage', requireAuth, fileController.getUsage);
router.get('/starred', requireAuth, fileController.listStarred);
router.get('/important', requireAuth, fileController.listImportant);

// Trash management (must be before /:id)
router.get('/trash', requireAuth, fileController.listTrash);
router.delete('/trash/empty', requireAuth, fileController.emptyTrash);
router.delete('/trash', requireAuth, fileController.emptyTrash);

// Recent activity
router.get('/recent', requireAuth, fileController.listRecent);
router.patch('/:id/access', requireAuth, fileController.recordAccess);

// Create, Get and Permanent delete
router.post('/', requireAuth, fileController.createItem);
router.delete('/:id/forever', requireAuth, fileController.deleteForever);
router.get('/:id', requireAuth, fileController.getById);

// Update flags and soft delete
router.patch('/:id/star', requireAuth, fileController.setStarred);
router.patch('/:id/important', requireAuth, fileController.setImportant);
router.patch('/:id/trash', requireAuth, fileController.setTrashed);

// Rename, move or move to trash
router.patch('/:id', requireAuth, fileController.updateItem);
router.delete('/:id', requireAuth, fileController.deleteItem);

// Permission sub-routes
router.use('/:id/permissions', requireAuth, permissionRoutes);

module.exports = router;