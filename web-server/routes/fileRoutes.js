const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// All routes start with /api/files
router.get('/', requireAuth, fileController.listAll);

// MUST be before "/:id"
router.get('/usage', requireAuth, fileController.getUsage);

router.get('/starred', requireAuth, fileController.listStarred);
router.get('/important', requireAuth, fileController.listImportant);

router.post('/', requireAuth, fileController.createItem);

router.get('/:id', requireAuth, fileController.getById);

router.patch('/:id/star', requireAuth, fileController.setStarred);
router.patch('/:id/important', requireAuth, fileController.setImportant);

router.patch('/:id', requireAuth, fileController.updateItem);
router.delete('/:id', requireAuth, fileController.deleteItem);

router.use('/:id/permissions', requireAuth, permissionRoutes);

router.get('/recent', requireAuth, fileController.listRecent);

router.patch('/:id/access', requireAuth, fileController.recordAccess);

router.patch('/:id/access', requireAuth, fileController.recordAccess);

module.exports = router;
