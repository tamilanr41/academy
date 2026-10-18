const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

function normalizeZodError(error) {
  if (error && Array.isArray(error.issues)) {
    return error.issues.map((i) => ({
      field: i.path && i.path.length ? i.path.join('.') : '_',
      message: i.message,
    }));
  }
  return undefined;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let errors = Array.isArray(err.errors) ? err.errors : undefined;

  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = normalizeZodError(err);
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.stack || err);
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (!env.isProd && statusCode >= 500 && err.stack) body.stack = err.stack.split('\n').slice(0, 5);

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
