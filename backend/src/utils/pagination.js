/**
 * Query parsing helpers shared by paginated list endpoints.
 */
function parsePagination(query = {}, { defaultLimit = 12, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { page, limit, skip, sortBy, sortOrder, sort: { [sortBy]: sortOrder } };
}

function buildRegex(value) {
  if (!value) return null;
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

module.exports = { parsePagination, buildRegex };
