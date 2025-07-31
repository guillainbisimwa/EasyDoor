const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         employee:
 *           $ref: '#/components/schemas/User'
 *         workingFrom:
 *           type: string
 *           enum: [office, home]
 *           description: Where the employee is working from
 *         office:
 *           $ref: '#/components/schemas/Office'
 *         clockIn:
 *           type: string
 *           format: date-time
 *           description: Clock in time
 *         clockOut:
 *           type: string
 *           format: date-time
 *           description: Clock out time
 *         duration:
 *           type: string
 *           description: Work duration in readable format
 *         isActive:
 *           type: boolean
 *           description: Whether the attendance session is currently active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workingFrom: {
    type: String,
    enum: ['office', 'home'],
    required: true
  },
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    default: null
  },
  clockIn: {
    type: Date,
    default: Date.now
  },
  clockOut: {
    type: Date,
    default: null
  },
  duration: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
attendanceSchema.index({ employee: 1 });
attendanceSchema.index({ workingFrom: 1 });
attendanceSchema.index({ office: 1 });
attendanceSchema.index({ clockIn: 1 });
attendanceSchema.index({ isActive: 1 });
attendanceSchema.index({ createdAt: 1 });

// Compound index for employee daily attendance
attendanceSchema.index({ 
  employee: 1, 
  clockIn: 1 
});

// Virtual for work hours in decimal format
attendanceSchema.virtual('workHours').get(function() {
  if (!this.clockIn || !this.clockOut) return 0;
  const duration = this.clockOut.getTime() - this.clockIn.getTime();
  return Math.round((duration / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
});

// Virtual to check if overtime (>8 hours)
attendanceSchema.virtual('isOvertime').get(function() {
  return this.workHours > 8;
});

// Virtual for current session duration (if active)
attendanceSchema.virtual('currentDuration').get(function() {
  if (!this.isActive || !this.clockIn) return null;
  
  const now = new Date();
  const duration = now.getTime() - this.clockIn.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Calculate duration when clockOut is set
attendanceSchema.pre('save', function(next) {
  if (this.clockIn && this.clockOut) {
    const duration = this.clockOut.getTime() - this.clockIn.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      this.duration = `${hours}h ${minutes}m`;
    } else {
      this.duration = `${minutes}m`;
    }
    
    // Set as inactive when clocked out
    this.isActive = false;
  }
  next();
});

// Validation: office is required when working from office
attendanceSchema.pre('save', function(next) {
  if (this.workingFrom === 'office' && !this.office) {
    const error = new Error('Office is required when working from office');
    error.status = 400;
    return next(error);
  }
  next();
});

// Ensure only one active attendance per employee
attendanceSchema.pre('save', async function(next) {
  if (this.isNew && this.isActive) {
    const existingActive = await this.constructor.findOne({
      employee: this.employee,
      isActive: true,
      _id: { $ne: this._id }
    });
    
    if (existingActive) {
      const error = new Error('Employee already has an active attendance session');
      error.status = 400;
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);