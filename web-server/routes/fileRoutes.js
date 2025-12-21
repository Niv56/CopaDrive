// Route definition for File endpoints.

const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const permissionRoutes = require('./permissionRoutes');

// GET /api/files - list ALL accessible items for the logged-in user (owned + shared)
router.get('/', requireAuth, fileController.listAll);

// POST /api/files - create file/folder metadata
router.post('/', requireAuth, fileController.createItem);

// GET /api/files/:id - get item metadata by id (requires ownership or permission)
router.get('/:id', requireAuth, fileController.getById);

// PATCH /api/files/:id - update item metadata
router.patch('/:id', requireAuth, fileController.updateItem);

// DELETE /api/files/:id - delete item metadata
router.delete('/:id', requireAuth, fileController.deleteItem);

// /api/files/:id/permissions - pass to permissionRoutes
router.use('/:id/permissions', permissionRoutes);

module.exports = router;
