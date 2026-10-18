const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware — validates req.body by default.
 * Usage: validate(schema) | validate(schema, 'query') | validate(schema, 'params')
 *
 * Options:
 *   providedOnly: true — PATCH semantics. Zod re-applies schema defaults for
 *   absent keys (even with .partial()), so we drop any key that was not present
 *   in the raw request body. Prevents partial updates from clobbering fields.
 */
function validate(schema, target = 'body', options = {}) {
  return function validateMiddleware(req, _res, next) {
    const raw = req[target];
    const result = schema.safeParse(raw);
    if (!result.success) {
      return next(ApiError.validation('Validation failed', result.error.issues.map((i) => ({
        field: i.path.join('.') || target,
        message: i.message,
      }))));
    }

    let data = result.data;
    if (options.providedOnly && target === 'body' && raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const providedKeys = new Set(Object.keys(raw));
      data = Object.fromEntries(Object.entries(data).filter(([key]) => providedKeys.has(key)));
    }

    // req.query is a getter-only property in Express 5, so validated query data
    // is exposed on req.validatedQuery while controllers keep using req.query.
    if (target === 'body') req.body = data;
    else if (target === 'params') req.params = data;
    else req.validatedQuery = data;
    next();
  };
}

module.exports = validate;
