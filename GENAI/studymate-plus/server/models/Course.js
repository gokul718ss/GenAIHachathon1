const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide course description'],
    maxlength: 500
  },
  instructor: {
    type: String,
    required: [true, 'Please provide instructor name']
  },
  category: {
    type: String,
    enum: ['Mathematics', 'Science', 'Technology', 'Language', 'Business', 'Arts', 'Other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    weeks: Number,
    hoursPerWeek: Number
  },
  syllabus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  aiBot: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: function() { return `${this.title} Assistant`; }
    },
    personality: {
      type: String,
      default: 'helpful and knowledgeable'
    }
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
