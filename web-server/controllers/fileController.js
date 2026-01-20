const fileService = require('../services/fileService');

// Handle GET /api/files - List top level files/folders
exports.listAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] listAll: User ${userId} is fetching files`);
    const items = await fileService.listTopLevel(userId);
    res.status(200).json(items);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] listAll: ${err.message}`);
    next(err);
  }
};

// Handle POST /api/files - Create new file or folder
exports.createItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    console.log(`[CONTROLLER] createItem: User ${ownerId} creating ${req.body.type}`);
    const created = await fileService.createItem(ownerId, req.body);

    res
      .status(201)
      .set('Location', `/api/files/${created.id}`)
      .json(created);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] createItem: ${err.message}`);
    next(err);
  }
};

// Handle GET /api/files/search 
exports.searchItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q } = req.query; 
    console.log(`[CONTROLLER] searchItems: User ${userId} searching for "${q}"`);
    const items = await fileService.searchItems(userId, q);
    res.status(200).json(items);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] searchItems: ${err.message}`);
    next(err);
  }
};

// Handle GET /api/files/:id 
exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] getById: User ${userId} requesting item ${req.params.id}`);
    const item = await fileService.getById(userId, req.params.id);
    res.status(200).json(item);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] getById: ${err.message}`);
    next(err);
  }
};

// Handle PATCH /api/files/:id 
exports.updateItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    console.log(`[CONTROLLER] updateItem: User ${ownerId} updating item ${req.params.id}`);
    const updated = await fileService.updateItem(ownerId, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] updateItem: ${err.message}`);
    next(err);
  }
};

// Handle DELETE /api/files/:id 
exports.deleteItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    console.log(`[CONTROLLER] deleteItem: User ${ownerId} moving ${req.params.id} to trash`);
    await fileService.deleteItem(ownerId, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(`[CONTROLLER ERROR] deleteItem: ${err.message}`);
    next(err);
  }
};

// Handle DELETE /api/files/:id/forever 
exports.deleteForever = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] deleteForever: User ${userId} deleting ${req.params.id} permanently`);
    await fileService.deleteForever(userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(`[CONTROLLER ERROR] deleteForever: ${err.message}`);
    next(err);
  }
};

// Flags and trash Handlers 

exports.setStarred = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { starred } = req.body;
    if (typeof starred !== 'boolean') return res.status(400).json({ error: 'starred must be boolean' });

    console.log(`[CONTROLLER] setStarred: User ${userId}, Item ${req.params.id}, State: ${starred}`);
    const updated = await fileService.setStarred(userId, req.params.id, starred);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.setImportant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { important } = req.body;
    if (typeof important !== 'boolean') return res.status(400).json({ error: 'important must be boolean' });

    console.log(`[CONTROLLER] setImportant: User ${userId}, Item ${req.params.id}, State: ${important}`);
    const updated = await fileService.setImportant(userId, req.params.id, important);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.listTrash = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await fileService.listTrash(userId);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

exports.emptyTrash = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] emptyTrash: User ${userId} is emptying trash`);
    await fileService.emptyTrash(userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Storage and recent Handlers

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
    console.log(`[CONTROLLER] recordAccess: User ${userId} accessed ${req.params.id}`);
    const updated = await fileService.updateAccessTime(userId, req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// Handle GET /api/files/starred
exports.listStarred = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] listStarred: Fetching starred items for user ${userId}`);
    const items = await fileService.listStarred(userId);
    res.status(200).json(items);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] listStarred: ${err.message}`);
    next(err);
  }
};

// Handle GET /api/files/important
exports.listImportant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[CONTROLLER] listImportant: Fetching important items for user ${userId}`);
    const items = await fileService.listImportant(userId);
    res.status(200).json(items);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] listImportant: ${err.message}`);
    next(err);
  }
};

// Handle PUT/PATCH trashed flag for a file/folder
exports.setTrashed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trashed } = req.body;

    if (typeof trashed !== 'boolean') {
      return res.status(400).json({ error: 'trashed must be boolean' });
    }

    console.log(`[CONTROLLER] setTrashed: User ${userId}, Item ${req.params.id}, State: ${trashed}`);
    const updated = await fileService.setTrashed(userId, req.params.id, trashed);
    res.status(200).json(updated);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] setTrashed: ${err.message}`);
    next(err);
  }
};