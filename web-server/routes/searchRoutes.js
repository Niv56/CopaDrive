const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { requireAuth } = require('../middleware/authMiddleware');

// Search for items based on a query string
router.get('/:query', requireAuth, searchController.search);

module.exports = router;