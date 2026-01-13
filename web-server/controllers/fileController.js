const fileService = require('../services/fileService');

// Handle GET /api/files.
exports.listAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listTopLevel(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Handle POST /api/files.
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

// Handle GET /api/files/:id.
exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const item = await fileService.getById(userId, req.params.id);
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

// Handle PATCH /api/files/:id.
exports.updateItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const updated = await fileService.updateItem(ownerId, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// Handle DELETE /api/files/:id (soft delete to trash).
exports.deleteItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    await fileService.deleteItem(ownerId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Handle DELETE /api/files/:id/forever.
exports.deleteForever = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await fileService.deleteForever(userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Handle GET /api/files/starred.
exports.listStarred = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listStarred(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Handle GET /api/files/important.
exports.listImportant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listImportant(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Handle PUT/PATCH starred flag for a file/folder.
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

// Handle PUT/PATCH important flag for a file/folder.
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

// Handle GET /api/files/trash.
exports.listTrash = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listTrash(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Handle PUT/PATCH trashed flag for a file/folder.
exports.setTrashed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trashed } = req.body;

    if (typeof trashed !== 'boolean') {
      return res.status(400).json({ error: 'trashed must be boolean' });
    }

    await fileService.setTrashed(userId, req.params.id, trashed);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Handle DELETE /api/files/trash/empty (and /api/files/trash as alias).
exports.emptyTrash = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await fileService.emptyTrash(userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Handle GET /api/files/usage.
exports.getUsage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const usage = await fileService.getOwnedStorageUsage(userId);
    res.status(200).json(usage);
  } catch (err) {
    next(err);
  }
};

// Handle GET /api/files/recent.
exports.listRecent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listRecent(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Handle POST/PUT /api/files/:id/access (record last access time).
exports.recordAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await fileService.updateAccessTime(userId, req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
