const AuditLog = require('../models/AuditLog');

/**
 * Fire-and-forget audit trail for privileged actions.
 * Logging must never break the request that triggered it.
 */
async function log({ actor, action, entity = '', entityId = '', summary = '', meta = {}, req, status = 'success' }) {
  try {
    await AuditLog.create({
      actor: actor ? actor._id || actor : undefined,
      actorEmail: actor?.email || '',
      actorRole: actor?.role || '',
      action,
      entity,
      entityId: entityId ? String(entityId) : '',
      summary,
      meta,
      status,
      ip: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '',
      userAgent: req ? String(req.headers['user-agent'] || '').slice(0, 300) : '',
    });
  } catch (err) {
    console.error('[audit] failed to write log:', err.message);
  }
}

module.exports = { log };
