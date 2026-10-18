const ROLES = ['super_admin', 'admin', 'staff', 'trainer', 'student'];

const ROLE_RANK = {
  super_admin: 4,
  admin: 3,
  staff: 2,
  trainer: 2,
  student: 1,
};

function rank(role) {
  return ROLE_RANK[role] || 0;
}

/**
 * Access rule: a user passes if their role is explicitly allowed,
 * or if they are a super_admin (who implicitly outranks every role).
 */
function roleAtLeast(role, allowed = []) {
  if (!role) return false;
  if (allowed.length === 0) return rank(role) > 0;
  if (allowed.includes(role)) return true;
  return role === 'super_admin';
}

module.exports = { ROLES, ROLE_RANK, rank, roleAtLeast };
