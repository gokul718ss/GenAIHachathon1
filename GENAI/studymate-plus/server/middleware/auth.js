const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('./errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    // Check header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthenticatedError('Authentication invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Optionally verify user still exists and is active
      const user = await User.findById(payload.userId).select('isActive');
      if (!user || !user.isActive) {
        throw new UnauthenticatedError('User account not found or inactive');
      }

      req.user = { userId: payload.userId, name: payload.name, email: payload.email };
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthenticatedError('Authentication invalid');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthenticatedError('Token expired');
      }
      throw error;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(error);
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      throw new UnauthenticatedError('Authentication required');
    }

    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      throw new UnauthenticatedError('Admin access required');
    }

    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    next(error);
  }
};

module.exports = { auth, adminAuth };
