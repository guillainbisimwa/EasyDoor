const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         visitor:
 *           $ref: '#/components/schemas/User'
 *         employee:
 *           $ref: '#/components/schemas/User'
 *         expectedClockIn:
 *           type: string
 *           format: date-time
 *           description: Expected arrival time
 *         clockIn:
 *           type: string
 *           format: date-time
 *           description: Actual arrival time
 *         clockOut:
 *           type: string
 *           format: date-time
 *           description: Departure time
 *         duration:
 *           type: string
 *           description: Visit duration in readable format
 *         reason:
 *           type: string
 *           description: Purpose of the visit
 *         comment:
 *           type: string
 *           description: Additional comments
 *         status:
 *           type: string
 *           enum: [pending, accepted, cancelled, in_progress, completed]
 *           description: Visit status
 *         office:
 *           $ref: '#/components/schemas/Office'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const visitSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expectedClockIn: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date,
    default: null
  },
  clockOut: {
    type: Date,
    default: null
  },
  duration: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'cancelled', 'in_progress', 'completed'],
    default: 'pending'
  },
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
visitSchema.index({ visitor: 1 });
visitSchema.index({ employee: 1 });
visitSchema.index({ status: 1 });
visitSchema.index({ expectedClockIn: 1 });
visitSchema.index({ clockIn: 1 });

// Virtual to check if visit is active
visitSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress';
});

// Virtual to check if visit is overdue
visitSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending') return false;
  return new Date() > this.expectedClockIn;
});

// Calculate duration when clockOut is set
visitSchema.pre('save', function(next) {
  if (this.clockIn && this.clockOut) {
    const duration = this.clockOut.getTime() - this.clockIn.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      this.duration = `${hours}h ${minutes}m`;
    } else {
      this.duration = `${minutes}m`;
    }
    
    // Automatically set status to completed when clocked out
    if (this.status === 'in_progress') {
      this.status = 'completed';
    }
  }
  next();
});

// Auto set status to in_progress when clockIn is set
visitSchema.pre('save', function(next) {
  if (this.clockIn && !this.clockOut && this.status === 'accepted') {
    this.status = 'in_progress';
  }
  next();
});

module.exports = mongoose.model('Visit', visitSchema);