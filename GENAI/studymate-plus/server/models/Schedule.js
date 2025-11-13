const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['study', 'quiz', 'assignment', 'exam', 'break', 'other'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [Number], // 0-6, Sunday-Saturday
    endDate: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  reminders: [{
    time: {
      type: Number, // minutes before event
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    type: String,
    default: 'Online'
  },
  notes: String,
  color: {
    type: String,
    default: '#3B82F6'
  }
});

const scheduleSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide schedule title']
  },
  description: String,
  items: [scheduleItemSchema],
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'manual'
  },
  aiPrompt: String, // Store the AI prompt used to generate this schedule
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'rejected', 'active'],
    default: 'draft'
  },
  approvalStatus: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    modifications: [String] // List of modifications made during approval
  },
  conflicts: [{
    item1: mongoose.Schema.Types.ObjectId,
    item2: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['time-overlap', 'resource-conflict', 'priority-conflict']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String
  }],
  preferences: {
    preferredStudyTimes: [String], // e.g., ['morning', 'afternoon', 'evening']
    breakDuration: {
      type: Number,
      default: 15 // minutes
    },
    studySessionDuration: {
      type: Number,
      default: 90 // minutes
    },
    includeWeekends: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    completionRate: {
      type: Number,
      default: 0
    },
    totalScheduledHours: {
      type: Number,
      default: 0
    },
    completedHours: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ student: 1, 'items.startTime': 1 });
scheduleSchema.index({ 'items.startTime': 1, 'items.endTime': 1 });

// Method to check for conflicts
scheduleSchema.methods.checkConflicts = function() {
  const conflicts = [];
  const items = this.items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  for (let i = 0; i < items.length - 1; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];

      if (item1.endTime > item2.startTime && item1.startTime < item2.endTime) {
        conflicts.push({
          item1: item1._id,
          item2: item2._id,
          type: 'time-overlap',
          severity: 'high'
        });
      }
    }
  }

  return conflicts;
};

module.exports = mongoose.model('Schedule', scheduleSchema);
