const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    
    createdAt: { type: String, required: true }, 
    updatedAt: { type: String, required: true },

    sizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },

    trashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    originalParentId: { type: Schema.Types.ObjectId, ref: 'File', default: null },

    starredBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    importantBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    trashedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    blockedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],

    trashedAtBy: { type: Map, of: Date, default: {} },
    lastAccessedBy: { type: Map, of: Date, default: {} }

}, { 
    timestamps: false 
});

fileSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        // Convert ObjectId fields to strings for client compatibility
        if (ret.ownerId) ret.ownerId = ret.ownerId.toString();
        if (ret.parentId) ret.parentId = ret.parentId.toString();
        if (ret.originalParentId) ret.originalParentId = ret.originalParentId.toString();
    }
});

fileSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        // Convert ObjectId fields to strings for client compatibility
        if (ret.ownerId) ret.ownerId = ret.ownerId.toString();
        if (ret.parentId) ret.parentId = ret.parentId.toString();
        if (ret.originalParentId) ret.originalParentId = ret.originalParentId.toString();
    }
});

module.exports = mongoose.model('File', fileSchema);