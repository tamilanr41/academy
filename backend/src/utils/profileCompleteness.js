/**
 * Student profile completeness rules.
 *
 * A student profile is "complete" once every field below is filled in. The
 * student dashboard blocks access to the rest of the app until then, so keep
 * this list in sync with the profile form in the frontend.
 */
const PROFILE_REQUIRED_FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'phone', label: 'Phone number' },
  { key: 'dateOfBirth', label: 'Date of birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'qualification', label: 'Educational qualification' },
  { key: 'address.line1', label: 'Address' },
  { key: 'address.city', label: 'City' },
  { key: 'address.state', label: 'State' },
  { key: 'address.pincode', label: 'Pincode' },
  { key: 'guardian.name', label: 'Guardian name' },
  { key: 'guardian.phone', label: 'Guardian phone' },
];

function readPath(source, path) {
  return path.split('.').reduce((acc, key) => (acc === null || acc === undefined ? acc : acc[key]), source);
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Returns { isComplete, missing } where `missing` is the list of field keys
 * that still need a value. Account level fields (name, phone) live on the User
 * document, everything else on the StudentProfile.
 */
function computeProfileCompleteness(user, profile) {
  const source = { ...(profile || {}) };
  if (user) {
    if (user.name !== undefined) source.name = user.name;
    if (user.phone !== undefined) source.phone = user.phone;
  }

  const missing = PROFILE_REQUIRED_FIELDS.filter(({ key }) => !isFilled(readPath(source, key))).map((f) => f.key);

  return { isComplete: missing.length === 0, missing };
}

module.exports = { PROFILE_REQUIRED_FIELDS, computeProfileCompleteness };
