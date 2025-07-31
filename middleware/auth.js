const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || user.active === 0) {
      return res.status(401).json({
        message: 'Invalid token. User not found or inactive.'
      });
    }

    req.user = { userId: user._id, user };
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token.',
      error: error.message
    });
  }
};

module.exports = auth;