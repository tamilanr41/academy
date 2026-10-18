const express = require('express');
const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const studentRoutes = require('./student.routes');
const adminRoutes = require('./admin.routes');
const { optionalAuth } = require('../middleware/auth');
const maintenance = require('../middleware/maintenance');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);
// Catalogue, content and public forms. Maintenance mode applies here only.
router.use('/', optionalAuth, maintenance, publicRoutes);

module.exports = router;
