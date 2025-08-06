const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  sheets: [{
    name: String,
    rowCount: Number,
    columnCount: Number,
    headers: [String],
    data: [[mongoose.Schema.Types.Mixed]] // Store first few rows for preview
  }],
  processingError: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
uploadSchema.index({ user: 1, uploadDate: -1 });
uploadSchema.index({ status: 1 });

module.exports = mongoose.model('Upload', uploadSchema); 