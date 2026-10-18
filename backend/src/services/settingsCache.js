const SiteSetting = require('../models/SiteSetting');

/**
 * Short-lived in-memory cache so settings are not re-read from MongoDB
 * on every single request. TTL keeps writes reasonably fresh.
 */
let cache = null;
let fetchedAt = 0;
const TTL_MS = 30 * 1000;

async function getSettings({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - fetchedAt < TTL_MS) return cache;
  cache = await SiteSetting.getSettings();
  fetchedAt = Date.now();
  return cache;
}

function invalidate() {
  cache = null;
  fetchedAt = 0;
}

module.exports = { getSettings, invalidate };
