const fileService = require('../services/fileService');


/**
 * GET /api/files
 * Retrieves all top-level files and folders for the authenticated user.
 */
exports.listAll = async (req, res, next) => {
  try {
    const userId = req.headers.authorization || null;

    if (!userId) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const items = await fileService.listAllFiles(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const created = await fileService.createItem(ownerId, req.body);

    res
      .status(201)
      .set('Location', `/api/files/${created.id}`)
      .json(created);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const item = await fileService.getById(userId, req.params.id);
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const updated = await fileService.updateItem(ownerId, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    await fileService.deleteItem(ownerId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
