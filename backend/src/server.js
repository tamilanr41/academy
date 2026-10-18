const fs = require('fs');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const createApp = require('./app');

async function bootstrap() {
  if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

  await connectDB();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[api] ${env.NODE_ENV} server listening on http://localhost:${env.PORT}`);
    console.log(`[api] CORS allowlist: ${env.CORS_ORIGINS.join(', ')}`);
    console.log(`[api] uploads: ${env.cloudinaryEnabled ? 'Cloudinary' : `local disk (${env.UPLOAD_DIR})`}`);
    console.log(`[api] email: ${env.smtpEnabled ? 'SMTP configured' : 'disabled (console only)'}`);
    console.log(`[api] payments: ${env.razorpayEnabled ? 'Razorpay configured' : 'disabled (offline workflow)'}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    console.error('[api] unhandled rejection:', reason);
  });
}

bootstrap().catch((err) => {
  console.error('[api] failed to start:', err.message);
  process.exit(1);
});
