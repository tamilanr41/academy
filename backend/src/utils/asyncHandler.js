/**
 * Wraps async route handlers so rejections reach the Express error middleware.
 * (Works with Express 5's built-in async handling too, but keeps behaviour explicit.)
 */
const asyncHandler = (fn) => function wrapped(req, res, next) {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
