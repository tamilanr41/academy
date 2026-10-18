const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { getSettings } = require('../services/settingsCache');

/**
 * Blocks public traffic while maintenance mode is enabled (SiteSettings or env).
 * Administrative roles always keep access. Requires optionalAuth to have run.
 */
const maintenance = asyncHandler(async (req, _res, next) => {
  if (req.user && ['super_admin', 'admin'].includes(req.user.role)) return next();

  let enabled = env.MAINTENANCE_MODE;
  if (!enabled) {
    try {
      const settings = await getSettings();
      enabled = Boolean(settings?.features?.maintenanceMode);
    } catch {
      enabled = false;
    }
  }
  if (!enabled) return next();
  next(ApiError.serviceUnavailable('The academy website is in maintenance mode. Please check back soon.'));
});

module.exports = maintenance;
