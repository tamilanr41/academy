const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

function buildLimiter({ windowMs, max, message }) {
  // Rate limiting is bypassed in tests so suites never fail on throttling.
  if (env.isTest) {
    return function noopLimiter(_req, _res, next) {
      next();
    };
  }
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Trust-proxy is configured globally on the Express app (app.set('trust proxy')).
    message: { success: false, message },
  });
}

const apiLimiter = buildLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: 'Too many authentication attempts, please try again in 15 minutes.',
});

const formLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many submissions from this IP, please try again later.',
});

module.exports = { apiLimiter, authLimiter, formLimiter };
