const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimit');
const { upload } = require('../services/uploadService');
const { storeFile } = require('../services/uploadService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/schemas');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', apiLimiter, authController.logout);
router.get('/me', protect, authController.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', protect, authLimiter, authController.resendVerification);
router.patch('/profile', protect, apiLimiter, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', protect, authLimiter, validate(changePasswordSchema), authController.changePassword);

router.post(
  '/avatar',
  protect,
  apiLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const result = await storeFile(req.file, 'academy/avatars');
    req.user.avatar = { url: result.url, publicId: result.publicId };
    await req.user.save();
    return success(res, { avatar: req.user.avatar }, 'Profile photo updated');
  })
);

module.exports = router;
