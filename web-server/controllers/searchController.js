const fileService = require('../services/fileService');

// Handle GET /api/search/:query.
exports.search = async (req, res, next) => {
    try {
        const { query } = req.params;
        const userId = req.user.id;

        const results = await fileService.searchItems(userId, query);
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
};
