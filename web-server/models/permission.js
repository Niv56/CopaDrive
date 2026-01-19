const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'File', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['viewer', 'editor', 'owner'], 
    default: 'viewer' 
  }
}, { timestamps: true });

permissionSchema.index({ userId: 1, fileId: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);