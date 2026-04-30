const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired at:', error.expiredAt);
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        expired: true,
        message: 'Your session has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid. Please login again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Token verification failed. Please login again.'
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
        req.userId = decoded.userId;
      }
    }
    next();
  } catch (error) {
    // Log expired tokens but continue without auth
    if (error.name === 'TokenExpiredError') {
      console.log('Optional auth: Token expired, continuing without authentication');
    }
    // Continue without auth
    next();
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // First verify authentication
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      console.log('Admin token expired at:', error.expiredAt);
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        expired: true,
        message: 'Your session has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid admin token:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid. Please login again.'
      });
    }
    
    console.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Token verification failed. Please login again.'
    });
  }
};

module.exports = { auth, optionalAuth, adminAuth };
