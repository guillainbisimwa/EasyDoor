const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         civility:
 *           type: string
 *           enum: [mr, mrs, ms]
 *           description: User's civility
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         imageUrl:
 *           type: string
 *           description: URL to user's profile image
 *         phone:
 *           type: string
 *           description: User's phone number
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: Encrypted password
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         employer:
 *           $ref: '#/components/schemas/Company'
 *         serviceCard:
 *           $ref: '#/components/schemas/ServiceCard'
 *         visits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visit'
 *         countryCode:
 *           type: string
 *           description: Country code
 *         languageCode:
 *           type: string
 *           description: Language preference code
 *         playerId:
 *           type: string
 *           description: Player ID for notifications
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *           description: User availability status
 *         admin:
 *           type: boolean
 *           description: Whether user has admin privileges
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         active:
 *           type: integer
 *           description: Active status (1 for active, 0 for inactive)
 */

const userSchema = new mongoose.Schema({
  civility: {
    type: String,
    enum: ['mr', 'mrs', 'ms'],
    default: null
  },
  firstName: {
    type: String,
    trim: true,
    default: null
  },
  lastName: {
    type: String,
    trim: true,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  token: {
    type: String,
    default: null
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  serviceCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCard',
    default: null
  },
  visits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  }],
  countryCode: {
    type: String,
    default: null
  },
  languageCode: {
    type: String,
    default: 'en'
  },
  playerId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  admin: {
    type: Boolean,
    default: false
  },
  active: {
    type: Number,
    default: 1,
    enum: [0, 1]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ employer: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);