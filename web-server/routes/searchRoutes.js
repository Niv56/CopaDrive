const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/:query', requireAuth, searchController.search);

module.exports = router;