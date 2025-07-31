const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCard:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         user:
 *           $ref: '#/components/schemas/User'
 *         company:
 *           $ref: '#/components/schemas/Company'
 *         position:
 *           type: string
 *           description: Employee position/title
 *         issueAt:
 *           type: string
 *           format: date-time
 *           description: Date when service card was issued
 *         expireAt:
 *           type: string
 *           format: date-time
 *           description: Date when service card expires
 *         isActive:
 *           type: boolean
 *           description: Whether the service card is currently active
 *         cardNumber:
 *           type: string
 *           description: Unique card number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const serviceCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  issueAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    required: true
  },
  cardNumber: {
    type: String,
    unique: true,
    required: true
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
serviceCardSchema.index({ user: 1 });
serviceCardSchema.index({ company: 1 });
serviceCardSchema.index({ cardNumber: 1 });
serviceCardSchema.index({ expireAt: 1 });
serviceCardSchema.index({ isActive: 1 });

// Virtual to check if card is expired
serviceCardSchema.virtual('isExpired').get(function() {
  return new Date() > this.expireAt;
});

// Virtual to check if card is valid (active and not expired)
serviceCardSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

// Virtual for days until expiration
serviceCardSchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const expiry = new Date(this.expireAt);
  const timeDiff = expiry.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Pre-save middleware to generate unique card number
serviceCardSchema.pre('save', async function(next) {
  if (!this.cardNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.cardNumber = `SC-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Set default expiry date to 1 year from issue date
serviceCardSchema.pre('save', function(next) {
  if (!this.expireAt && this.issueAt) {
    const expiry = new Date(this.issueAt);
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.expireAt = expiry;
  }
  next();
});

module.exports = mongoose.model('ServiceCard', serviceCardSchema);