const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = user.createJWT();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      stats: user.stats
    };

    logger.info(`User registered: ${email}`);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthenticatedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthenticatedError('Account has been deactivated');
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.createJWT();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      stats: user.stats,
      lastLogin: user.lastLogin
    };

    logger.info(`User logged in: ${email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('preferences')
      .select('-password');

    if (!user) {
      throw new UnauthenticatedError('User not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, preferences, profilePicture } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new UnauthenticatedError('User not found');
    }

    logger.info(`Profile updated for user: ${user.email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Please provide current and new password');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }

    // Verify current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};

const logout = async (req, res) => {
  try {
    // For JWT, logout is handled on the client side by removing the token
    // Here we can implement token blacklisting if needed

    logger.info(`User logged out: ${req.user.userId}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
