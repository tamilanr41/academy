const User = require('../models/User');
const Course = require('../models/Course');
const CourseApplication = require('../models/CourseApplication');
const Enquiry = require('../models/Enquiry');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const Trainer = require('../models/Trainer');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const stats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    activeCourses,
    totalApplications,
    pendingApplications,
    totalEnquiries,
    openEnquiries,
    upcomingBatches,
    recentStudents,
    recentEnquiries,
    activeEnrollments,
    totalTrainers,
    statusAgg,
    paidRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments({ isPublished: true, status: 'published' }),
    CourseApplication.countDocuments(),
    CourseApplication.countDocuments({ status: { $in: ['new', 'under_review'] } }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: { $in: ['new', 'in_progress'] } }),
    Batch.countDocuments({ status: { $in: ['upcoming', 'ongoing'] }, startDate: { $gte: now } }),
    User.find({ role: 'student', createdAt: { $gte: sevenDaysAgo } }).countDocuments(),
    Enquiry.find({ createdAt: { $gte: sevenDaysAgo } }).countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Trainer.countDocuments({ isActive: true }),
    CourseApplication.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
  ]);

  const [recentApplications, recentEnq] = await Promise.all([
    CourseApplication.find().populate('course', 'title').sort({ createdAt: -1 }).limit(6).lean(),
    Enquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  return success(res, {
    totalStudents,
    activeCourses,
    totalApplications,
    pendingApplications,
    totalEnquiries,
    openEnquiries,
    upcomingBatches,
    recentStudents,
    recentEnquiries,
    activeEnrollments,
    totalTrainers,
    revenue: paidRevenue[0]?.total || 0,
    paymentCount: paidRevenue[0]?.count || 0,
    applicationStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
    recentApplications,
    recentEnquiries: recentEnq,
  }, 'Dashboard stats fetched');
});

const analytics = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(1, parseInt(req.query.months, 10) || 12));
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const monthlySignupPipeline = [
    { $match: { role: 'student', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ];

  const monthlyApplicationPipeline = [
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ];

  const coursePopularityPipeline = [
    { $group: { _id: '$course', applications: { $sum: 1 } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: false } },
    { $project: { _id: 0, courseId: '$_id', title: '$course.title', slug: '$course.slug', applications: 1, enrolledCount: '$course.enrolledCount', fee: '$course.fee' } },
    { $sort: { applications: -1 } },
    { $limit: 8 },
  ];

  const enquirySourcePipeline = [
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];

  const enrollmentMonthlyPipeline = [
    { $match: { enrolledAt: { $gte: since } } },
    { $group: { _id: { y: { $year: '$enrolledAt' }, m: { $month: '$enrolledAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ];

  const [signups, applications, popularity, enquiryTypes, enrollments] = await Promise.all([
    User.aggregate(monthlySignupPipeline),
    CourseApplication.aggregate(monthlyApplicationPipeline),
    CourseApplication.aggregate(coursePopularityPipeline),
    Enquiry.aggregate(enquirySourcePipeline),
    Enrollment.aggregate(enrollmentMonthlyPipeline),
  ]);

  const monthLabel = (key) => {
    const date = new Date(key.y, key.m - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
  };

  const mergeSeries = (a, b, labelA, labelB) => {
    const map = new Map();
    [...a, ...b].forEach((r) => {
      const k = monthLabel(r._id);
      if (!map.has(k)) map.set(k, { month: k, [labelA]: 0, [labelB]: 0 });
    });
    a.forEach((r) => {
      const row = map.get(monthLabel(r._id));
      if (row) row[labelA] = r.count;
    });
    b.forEach((r) => {
      const row = map.get(monthLabel(r._id));
      if (row) row[labelB] = r.count;
    });
    return Array.from(map.values());
  };

  return success(res, {
    monthlySignups: signups.map((s) => ({ month: monthLabel(s._id), count: s.count })),
    monthlyApplications: applications.map((s) => ({ month: monthLabel(s._id), count: s.count })),
    monthlyEnrollments: enrollments.map((s) => ({ month: monthLabel(s._id), count: s.count })),
    combinedMonthly: mergeSeries(signups, applications, 'signups', 'applications'),
    coursePopularity: popularity,
    enquiryTypes: enquiryTypes.map((e) => ({ type: e._id, count: e.count })),
  }, 'Analytics fetched');
});

module.exports = { stats, analytics };
