const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, paginated } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const emailService = require('../services/emailService');
const ApiError = require('../utils/ApiError');
const { toCSV, sendCSV } = require('../utils/csv');

/* -------------------------------- newsletter ------------------------------- */

const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  let subscriber = await NewsletterSubscriber.findOne({ email });

  if (subscriber && subscriber.isActive) {
    return success(res, { email }, 'You are already subscribed to our newsletter');
  }
  if (subscriber) {
    subscriber.isActive = true;
    subscriber.unsubscribedAt = undefined;
    await subscriber.save();
  } else {
    subscriber = await NewsletterSubscriber.create({ email });
  }

  await emailService.sendMail({
    to: email,
    subject: 'Subscription confirmed',
    html: '<p>You are now subscribed to our newsletter. We will share course updates, events and offers.</p>',
  });
  return created(res, { email }, 'Subscribed successfully');
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await NewsletterSubscriber.updateOne({ email }, { isActive: false, unsubscribedAt: new Date() });
  return success(res, null, 'You have been unsubscribed');
});

const listSubscribers = asyncHandler(async (req, res) => {
  const { search, status, export: exportCsv } = req.query;
  const { page: p, limit: l, skip } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 200 });

  const filter = {};
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) filter.email = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  if (exportCsv === 'csv') {
    const rows = await NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).limit(10000).lean();
    const csv = toCSV(rows, [
      { key: 'email', label: 'Email' },
      { label: 'Active', value: (r) => (r.isActive ? 'Yes' : 'No') },
      { label: 'Subscribed On', value: (r) => (r.createdAt ? new Date(r.createdAt).toISOString() : '') },
    ]);
    return sendCSV(res, `newsletter-${Date.now()}.csv`, csv);
  }

  const [items, total] = await Promise.all([
    NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    NewsletterSubscriber.countDocuments(filter),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Subscribers fetched' });
});

/* ------------------------------- notifications ------------------------------ */

const myNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { page: p, limit: l, skip } = parsePagination({ page, limit }, { defaultLimit: 20 });

  const filter = { user: req.user._id };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  return paginated(res, { items, total, page: p, limit: l, message: 'Notifications fetched' });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  return success(res, { count }, 'Unread count fetched');
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return success(res, notification, 'Notification marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  return success(res, { modified: result.modifiedCount }, 'All notifications marked as read');
});

/** Announcements visible to the logged-in student. */
const myAnnouncements = asyncHandler(async (req, res) => {
  const now = new Date();
  const items = await Announcement.find({
    isPublished: true,
    audience: { $in: ['all', req.user.role === 'student' ? 'students' : 'staff'] },
    publishAt: { $lte: now },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }],
  })
    .sort({ publishAt: -1 })
    .limit(50)
    .lean();
  return success(res, items, 'Announcements fetched');
});

module.exports = { subscribe, unsubscribe, listSubscribers, myNotifications, unreadCount, markRead, markAllRead, myAnnouncements };
