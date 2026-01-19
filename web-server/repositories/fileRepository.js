const File = require('../models/file');

const normalizeParentId = (parentId) => 
    (parentId === undefined || parentId === 'root' || parentId === 'null' || parentId === null) ? null : parentId;

const findByParent = async (parentId, ownerId) => {
    const p = normalizeParentId(parentId);
    const query = {
        parentId: p,
        trashed: { $ne: true } 
    };
    if (ownerId) query.ownerId = ownerId;

    return await File.find(query);
};

const findAll = async () => await File.find({});

const findById = async (id, ownerId) => {
    const query = { _id: id };
    if (ownerId) query.ownerId = ownerId;
    
    return await File.findOne(query);
};

const create = async (fileData) => {
    const newFile = new File({
        mimeType: "",
        trashed: false,
        trashedAt: null,
        originalParentId: null,
        starredBy: [],
        importantBy: [],
        trashedBy: [],
        blockedBy: [],
        trashedAtBy: {},
        lastAccessedBy: {},
        ...fileData
    });

    return await newFile.save();
};

const update = async (id, updates, ownerId) => {
    const query = { _id: id };
    if (ownerId) query.ownerId = ownerId;

    return await File.findOneAndUpdate(query, updates, { new: true });
};

const remove = async (id, ownerId) => {
    const query = { _id: id };
    if (ownerId) query.ownerId = ownerId;

    return await File.findOneAndDelete(query);
};

const hasChildren = async (parentId, ownerId) => {
    const p = normalizeParentId(parentId);
    const count = await File.countDocuments({
        parentId: p,
        ownerId: ownerId,
        trashed: { $ne: true }
    });
    return count > 0;
};

const searchFiles = async (userId, sharedIds, query) => {
    return await File.find({
        $or: [
            { ownerId: userId },           
            { _id: { $in: sharedIds } }    
        ],
        trashed: { $ne: true },            
        name: { $regex: query, $options: 'i' } 
    });
};

const findTrashed = async (ownerId) => {
    return await File.find({ ownerId: ownerId, trashed: true });
};

const findByIds = async (idsArray) => {
    return await File.find({ _id: { $in: idsArray } });
};

const findAllByOwner = async (ownerId) => {
    return await File.find({ ownerId: ownerId });
};

const findByParentIncludingTrashed = async (parentId) => {
    const p = normalizeParentId(parentId);
    return await File.find({ parentId: p });
};

module.exports = {
    findByParent,
    findById,
    create,
    update,
    remove,
    hasChildren,
    searchFiles,
    findByIds,
    findAll,
    findTrashed,
    findAllByOwner,
    findByParentIncludingTrashed,
};