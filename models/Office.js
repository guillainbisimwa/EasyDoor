const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Office:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: Office name
 *         address:
 *           type: string
 *           description: Office address
 *         city:
 *           type: string
 *           description: Office city
 *         country:
 *           type: string
 *           description: Office country
 *         zipCode:
 *           type: string
 *           description: Office zip code
 *         phone:
 *           type: string
 *           description: Office phone number
 *         email:
 *           type: string
 *           description: Office email
 *         capacity:
 *           type: integer
 *           description: Maximum capacity of the office
 *         currentOccupancy:
 *           type: integer
 *           description: Current number of people in office
 *         company:
 *           $ref: '#/components/schemas/Company'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         active:
 *           type: boolean
 *           description: Whether office is active
 */

const officeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  capacity: {
    type: Number,
    default: 50,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
officeSchema.index({ company: 1 });
officeSchema.index({ city: 1 });
officeSchema.index({ active: 1 });

// Virtual for occupancy percentage
officeSchema.virtual('occupancyPercentage').get(function() {
  return this.capacity > 0 ? Math.round((this.currentOccupancy / this.capacity) * 100) : 0;
});

// Virtual for available space
officeSchema.virtual('availableSpace').get(function() {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

// Validate that current occupancy doesn't exceed capacity
officeSchema.pre('save', function(next) {
  if (this.currentOccupancy > this.capacity) {
    const error = new Error('Current occupancy cannot exceed office capacity');
    error.status = 400;
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Office', officeSchema);