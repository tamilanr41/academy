/**
 * Consistent API response helpers.
 */
function success(res, data = null, message = 'OK', meta = undefined) {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  if (meta) body.meta = meta;
  return res.json(body);
}

function created(res, data = null, message = 'Created', meta = undefined) {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  if (meta) body.meta = meta;
  return res.status(201).json(body);
}

function paginated(res, { items, total, page, limit, message = 'OK' }) {
  return res.json({
    success: true,
    message,
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

module.exports = { success, created, paginated };
