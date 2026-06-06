const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {

  console.error('ERROR:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Mongoose duplicate key error (e.g. email already exists)
  // Error code 11000 means unique constraint was violated
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // which field was duplicate
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    statusCode = 400;
  }

  // Mongoose bad ObjectId (e.g. /api/projects/notanid)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.';
    statusCode = 401;
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;