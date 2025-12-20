/**
 * Route definition for File endpoints.
 */
const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');

// GET /api/files - list top-level items for the logged-in user
router.get('/', requireAuth, fileController.listTopLevel);

// POST /api/files - create file/folder metadata
router.post('/', requireAuth, fileController.createItem);

// GET /api/files/:id - get item metadata by id
router.get('/:id', requireAuth, fileController.getById);

// PATCH /api/files/:id - update item metadata
router.patch('/:id', requireAuth, fileController.updateItem);

// DELETE /api/files/:id - delete item metadata (blocked if folder not empty)
router.delete('/:id', requireAuth, fileController.deleteItem);

module.exports = router;
