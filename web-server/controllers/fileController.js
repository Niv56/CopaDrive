const fileService = require('../services/fileService');


/**
 * GET /api/files
 * Retrieves all top-level files and folders for the authenticated user.
 */
exports.listAll = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await fileService.listTopLevel(userId);
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
exports.listStarred = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listStarred(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

exports.listImportant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listImportant(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

exports.setStarred = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { starred } = req.body;

    if (typeof starred !== 'boolean') {
      return res.status(400).json({ error: 'starred must be boolean' });
    }

    await fileService.setStarred(userId, req.params.id, starred);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.setImportant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { important } = req.body;

    if (typeof important !== 'boolean') {
      return res.status(400).json({ error: 'important must be boolean' });
    }

    await fileService.setImportant(userId, req.params.id, important);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
exports.getUsage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const usage = await fileService.getOwnedStorageUsage(userId);
    res.status(200).json(usage);
  } catch (err) {
    next(err);
  }
};



exports.listRecent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listRecent(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

exports.recordAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await fileService.updateAccessTime(userId, req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};