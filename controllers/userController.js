const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// @desc Register a new user
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, civility } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
        field: 'email'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      civility
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);
    user.token = token;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    res.status(400).json({
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, active: 1 });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate new token
    const token = generateToken(user._id);
    user.token = token;
    await user.save();

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, admin } = req.query;
    
    const query = { active: 1 };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by admin role if provided
    if (admin !== undefined) {
      query.admin = admin === 'true';
    }

    const users = await User.find(query)
      .populate('employer', 'fullName acronym')
      .populate('serviceCard')
      .populate('visits')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('employer', 'fullName acronym logoUrl')
      .populate('serviceCard')
      .populate('visits');

    if (!user || user.active === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// @desc Update user (PATCH)
// @route PATCH /api/users/:id
// @access Private
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    // Handle password update separately
    if (updates.password) {
      const salt = await bcrypt.genSalt(12);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('employer', 'fullName acronym')
     .populate('serviceCard')
     .populate('visits');

    if (!user || user.active === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// @desc Delete user (soft delete)
// @route DELETE /api/users/:id
// @access Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: 0 },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc Get current user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('employer', 'fullName acronym logoUrl')
      .populate('serviceCard')
      .populate('visits');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// @desc Logout user
// @route POST /api/users/logout
// @access Private
const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { token: null });
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  logoutUser
};