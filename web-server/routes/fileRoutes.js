const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// List all files accessible to the user
router.get('/', requireAuth, fileController.listAll);

// Get storage usage statistics
router.get('/usage', requireAuth, fileController.getUsage);

// List special category files
router.get('/starred', requireAuth, fileController.listStarred);
router.get('/important', requireAuth, fileController.listImportant);

<<<<<<< HEAD
// List files currently in the trash
router.get('/trash', requireAuth, fileController.listTrash);

// Permanently empty the trash
router.delete('/trash/empty', requireAuth, fileController.emptyTrash);
router.delete('/trash', requireAuth, fileController.emptyTrash);

// List recently accessed files
=======
// Trash routes (must be before "/:id")
router.get('/trash', requireAuth, fileController.listTrash);

// Empty trash (support both)
router.delete('/trash/empty', requireAuth, fileController.emptyTrash);
router.delete('/trash', requireAuth, fileController.emptyTrash);

// Recent + access (must be before "/:id")
>>>>>>> 282a37b (BUGS FIXED)
router.get('/recent', requireAuth, fileController.listRecent);

// Update last accessed timestamp
router.patch('/:id/access', requireAuth, fileController.recordAccess);

// Create a new file or folder
router.post('/', requireAuth, fileController.createItem);

<<<<<<< HEAD
// Permanently delete a specific file
=======
// Delete forever (permanent)
>>>>>>> 282a37b (BUGS FIXED)
router.delete('/:id/forever', requireAuth, fileController.deleteForever);

// Get file details by ID
router.get('/:id', requireAuth, fileController.getById);

// Toggle file flags
router.patch('/:id/star', requireAuth, fileController.setStarred);
router.patch('/:id/important', requireAuth, fileController.setImportant);

<<<<<<< HEAD
// Move file to or from trash
=======
// set/unset trash
>>>>>>> 282a37b (BUGS FIXED)
router.patch('/:id/trash', requireAuth, fileController.setTrashed);

// Update file details (rename/move)
router.patch('/:id', requireAuth, fileController.updateItem);

// Soft delete a file (move to trash)
router.delete('/:id', requireAuth, fileController.deleteItem);

// Handle file permissions
router.use('/:id/permissions', requireAuth, permissionRoutes);

module.exports = router;