const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'open-ended', 'fill-blank'],
    required: true
  },
  options: [String], // For multiple choice questions
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  },
  tags: [String]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide quiz title'],
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowRetake: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'manual'
  },
  sourceDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'rejected'],
    default: 'draft'
  },
  approvalStatus: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
  },
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number
    }],
    score: Number,
    percentage: Number,
    passed: Boolean,
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number // in seconds
  }],
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total points when questions are added
quizSchema.pre('save', function() {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
});

module.exports = mongoose.model('Quiz', quizSchema);
