const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

// Custom error classes
class CustomAPIError extends Error {
  constructor(message) {
    super(message);
  }
}

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

// Error handler middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  logger.error('Error caught by error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, try again later'
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    customError.message = 'Invalid token, please log in again';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  if (err.name === 'TokenExpiredError') {
    customError.message = 'Token expired, please log in again';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    customError.message = 'File too large';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    customError.message = 'Unexpected field name in file upload';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Send error response
  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandlerMiddleware,
  notFound,
  CustomAPIError,
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
  UnauthorizedError
};
