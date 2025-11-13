const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Please provide filename']
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: String,
  type: {
    type: String,
    enum: ['syllabus', 'lecture-notes', 'textbook', 'assignment', 'other'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedContent: {
    text: String,
    chunks: [{
      content: String,
      embedding: [Number],
      chunkIndex: Number,
      pageNumber: Number
    }],
    isProcessed: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    processingError: String
  },
  vectorIndex: {
    faissIndex: String, // Path to FAISS index file
    indexId: String,
    isIndexed: {
      type: Boolean,
      default: false
    },
    indexedAt: Date
  },
  metadata: {
    title: String,
    author: String,
    subject: String,
    keywords: [String],
    pageCount: Number,
    language: String,
    createdDate: Date,
    modifiedDate: Date
  },
  analysis: {
    topics: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    estimatedReadingTime: Number, // in minutes
    keyTerms: [String],
    summary: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error'],
    default: 'uploading'
  }
}, {
  timestamps: true
});

// Index for search functionality
documentSchema.index({ 
  'metadata.title': 'text', 
  'metadata.subject': 'text', 
  'metadata.keywords': 'text',
  'processedContent.text': 'text'
});

// Pre-save middleware to generate URL
documentSchema.pre('save', function() {
  if (this.path && !this.url) {
    this.url = `/uploads/${this.filename}`;
  }
});

// Method to increment download count
documentSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('Document', documentSchema);
