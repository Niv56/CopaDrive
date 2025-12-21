/**
 * File Controller
 * Handles HTTP requests related to files/folders metadata.
 */
const fileService = require('../services/fileService');

exports.listTopLevel = (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const items = fileService.listTopLevel(ownerId);
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
    const ownerId = req.user.id;
    const item = await fileService.getById(ownerId, req.params.id);
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const updated = fileService.updateItem(ownerId, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const result = await fileService.deleteItem(ownerId, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
