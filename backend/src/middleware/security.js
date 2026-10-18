const ApiError = require('../utils/ApiError');

const FORBIDDEN_KEYS = /^\$/;
const FORBIDDEN_FIELD = /[.$]/;

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Buffer)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.test(k) || FORBIDDEN_FIELD.test(k)) continue;
      out[k] = sanitizeValue(v);
    }
    return out;
  }
  return value;
}

/**
 * Strips MongoDB operator injection keys ($, .) from body and params.
 * (Replaces express-mongo-sanitize, which mutates the read-only req.query in Express 5.)
 */
function sanitize(req, _res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query && typeof req.query === 'object') {
    for (const k of Object.keys(req.query)) {
      if (FORBIDDEN_KEYS.test(k) || FORBIDDEN_FIELD.test(k)) delete req.query[k];
    }
  }
  next();
}

/**
 * Rejects cross-origin state-changing requests when the Origin header is present
 * and is not part of the API allowlist (CSRF defence for cookie auth).
 */
function originCheck(allowedOrigins) {
  const allowed = new Set(allowedOrigins || []);
  return function originMiddleware(req, _res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (!origin) return next();
    const host = req.headers.host;
    const selfOrigins = [`http://${host}`, `https://${host}`];
    if (allowed.has(origin) || selfOrigins.includes(origin)) return next();
    next(ApiError.forbidden('Cross-origin request blocked'));
  };
}

module.exports = { sanitize, originCheck };
