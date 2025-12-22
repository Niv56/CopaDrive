const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// All routes start with /api/files
router.get('/', requireAuth, fileController.listAll);

router.post('/', requireAuth, fileController.createItem);

router.get('/:id', requireAuth, fileController.getById);

router.patch('/:id', requireAuth, fileController.updateItem);

router.delete('/:id', requireAuth, fileController.deleteItem);

router.use('/:id/permissions', permissionRoutes);

module.exports = router;
