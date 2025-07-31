const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         acronym:
 *           type: string
 *           description: Company acronym/short name
 *         fullName:
 *           type: string
 *           description: Company full name
 *         logoUrl:
 *           type: string
 *           description: URL to company logo
 *         office:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Office'
 *         admin:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         employee:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         inOffice:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         outOfService:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         visitorCount:
 *           type: integer
 *           description: Total number of visitors
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         active:
 *           type: boolean
 *           description: Whether company is active
 */

const companySchema = new mongoose.Schema({
  acronym: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  office: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office'
  }],
  admin: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  employee: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  inOffice: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  outOfService: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  visitorCount: {
    type: Number,
    default: 0,
    min: 0
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
companySchema.index({ acronym: 1 });
companySchema.index({ fullName: 1 });
companySchema.index({ active: 1 });

// Virtual for total employee count
companySchema.virtual('totalEmployees').get(function() {
  return this.employee ? this.employee.length : 0;
});

// Virtual for admin count
companySchema.virtual('totalAdmins').get(function() {
  return this.admin ? this.admin.length : 0;
});

// Virtual for office count
companySchema.virtual('totalOffices').get(function() {
  return this.office ? this.office.length : 0;
});

module.exports = mongoose.model('Company', companySchema);