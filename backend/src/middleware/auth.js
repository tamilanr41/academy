const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, COOKIE_NAME } = require('../services/tokenService');
const { roleAtLeast } = require('../utils/roles');

function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/**
 * Authenticates the request from the HTTP-only JWT cookie (or Bearer header).
 */
const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('You must be logged in to access this resource');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Session expired, please log in again');
    throw ApiError.unauthorized('Invalid session, please log in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated. Contact the academy.');

  req.user = user;
  next();
});

/**
 * Attaches req.user when a valid token is present, but never rejects.
 * Used for endpoints that behave differently for signed-in users (e.g. reviews).
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore invalid tokens on optional routes
  }
  next();
});

/**
 * Role gate for protected routes: authorize('admin', 'staff')
 */
const authorize = (...allowed) =>
  function authorizeMiddleware(req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roleAtLeast(req.user.role, allowed)) {
      return next(ApiError.forbidden(`This action requires one of: ${allowed.join(', ')}`));
    }
    next();
  };

/**
 * Resource ownership helper — students may only touch their own records.
 */
function assertOwnership(req, resourceUserId, message = 'You are not allowed to access this record') {
  if (req.user.role === 'super_admin' || req.user.role === 'admin') return;
  const ownerId = resourceUserId ? String(resourceUserId._id || resourceUserId) : null;
  if (!ownerId || ownerId !== String(req.user._id)) {
    throw ApiError.forbidden(message);
  }
}

module.exports = { protect, optionalAuth, authorize, assertOwnership, extractToken };
