const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { requireAuth } = require('../middleware/authMiddleware');

// Route starts with /api/search
router.get('/:query', requireAuth, searchController.search);

module.exports = router;