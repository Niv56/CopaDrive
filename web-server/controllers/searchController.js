const fileService = require('../services/fileService');

/**
 * Implement GET /api/search/:query.
 */
exports.search = async (req, res, next) => {
    try {
        const { query } = req.params; // Extract from URL
        const userId = req.user.id;   // From requireAuth middleware

        // Fetch matching files/folders for this specific user
        const results = await fileService.searchItems(userId, query);

        // Response returned in JSON format only
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
};