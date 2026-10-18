const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const paymentController = require('./controllers/paymentController');
const { notFound, errorHandler } = require('./middleware/error');
const { sanitize, originCheck } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimit');

function createApp() {
  const app = express();

  app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  };
  app.use(cors(corsOptions));

  // Root ping — hosting platforms (Render, nginx, tunnels) probe `/` by default.
  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Academy API', health: '/api/health' });
  });

  // Health check (no DB dependency beyond a readyState report)
  app.get('/api/health', (_req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      success: true,
      message: 'API is running',
      data: {
        service: 'academy-backend',
        env: env.NODE_ENV,
        database: states[mongoose.connection.readyState] || 'unknown',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Razorpay webhook needs the raw body for signature verification,
  // so it must be registered before the JSON parser.
  app.post('/api/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }), paymentController.webhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use(sanitize);
  app.use(originCheck(env.CORS_ORIGINS));

  // Locally stored uploads (used when Cloudinary is not configured)
  app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d', fallthrough: true }));

  app.use('/api', apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
