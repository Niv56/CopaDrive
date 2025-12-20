const fileRepository = require('../repositories/fileRepository');

/**
 * Implement GET /api/search/:query.
 */
exports.search = (req, res, next) => {
    try {
        const { query } = req.params; // Extract from URL
        const userId = req.user.id;   // From requireAuth middleware

        // Fetch matching files/folders for this specific user
        const results = fileRepository.searchFiles(userId, query);

        // Response returned in JSON format only
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
};