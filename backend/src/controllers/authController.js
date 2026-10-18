const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { signToken, setAuthCookie, clearAuthCookie, randomToken, hashToken } = require('../services/tokenService');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');
const { getSettings } = require('../services/settingsCache');
const env = require('../config/env');

async function buildSession(user) {
  const profile = user.role === 'student' ? await StudentProfile.findOne({ user: user._id }).lean() : null;
  return { user, profile };
}

const register = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (!settings.features.registrationEnabled) {
    throw ApiError.serviceUnavailable('Online registration is currently disabled. Please contact the academy.');
  }

  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists. Try logging in.');

  const user = await User.create({ name, email, password, phone: phone || '', role: 'student' });
  await StudentProfile.create({ user: user._id });

  const verificationToken = randomToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const link = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await emailService.send('welcome', user.email, { name: user.name });
  await emailService.send('verifyEmail', user.email, { name: user.name, link });

  await auditService.log({ actor: user, action: 'auth.register', entity: 'User', entityId: user._id, summary: 'Student self-registration', req });

  setAuthCookie(res, signToken(user));
  const session = await buildSession(user);
  return created(res, session, 'Account created successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const invalid = ApiError.unauthorized('Invalid email or password');
  if (!user) throw invalid;

  const matches = await user.comparePassword(password);
  if (!matches) throw invalid;
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated. Please contact the academy.');

  user.lastLoginAt = new Date();
  await user.save();

  await auditService.log({ actor: user, action: 'auth.login', entity: 'User', entityId: user._id, summary: 'User logged in', req });
  setAuthCookie(res, signToken(user));
  const session = await buildSession(user);
  return success(res, session, 'Logged in successfully');
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await auditService.log({ actor: req.user, action: 'auth.logout', entity: 'User', entityId: req.user._id, summary: 'User logged out', req });
  }
  clearAuthCookie(res);
  return success(res, null, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  const session = await buildSession(req.user);
  return success(res, session, 'OK');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !user.isActive) {
    // Do not reveal whether the account exists.
    return success(res, null, 'If an account exists for that email, a reset link has been sent.');
  }

  const token = randomToken();
  user.passwordResetToken = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const result = await emailService.send('resetPassword', user.email, { name: user.name, link });

  await auditService.log({ actor: user, action: 'auth.forgot_password', entity: 'User', entityId: user._id, summary: 'Password reset requested', req });
  return success(res, { delivery: result }, 'If an account exists for that email, a reset link has been sent.');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired. Please request a new one.');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await auditService.log({ actor: user, action: 'auth.reset_password', entity: 'User', entityId: user._id, summary: 'Password reset completed', req });
  return success(res, null, 'Password updated. You can now log in with your new password.');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.body.token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw ApiError.badRequest('Verification link is invalid or has expired.');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return success(res, { email: user.email }, 'Email verified successfully');
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.isEmailVerified) return success(res, null, 'Email is already verified');

  const token = randomToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const link = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const delivery = await emailService.send('verifyEmail', user.email, { name: user.name, link });
  return success(res, { delivery }, 'Verification email sent');
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, ...profileFields } = req.body;

  const user = req.user;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();

  const set = {};
  if (profileFields.dateOfBirth !== undefined && profileFields.dateOfBirth !== '') set.dateOfBirth = new Date(profileFields.dateOfBirth);
  if (profileFields.dateOfBirth === '') set.dateOfBirth = null;
  for (const key of ['gender', 'qualification', 'occupation', 'bio']) {
    if (profileFields[key] !== undefined) set[key] = profileFields[key];
  }
  if (profileFields.address) set['address'] = profileFields.address;
  if (profileFields.guardian) set['guardian'] = profileFields.guardian;

  const profile = await StudentProfile.findOneAndUpdate(
    { user: user._id },
    { $set: set },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return success(res, { user, profile }, 'Profile updated');
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;

  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  await auditService.log({ actor: user, action: 'auth.change_password', entity: 'User', entityId: user._id, summary: 'Password changed', req });
  return success(res, null, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  updateProfile,
  changePassword,
};
