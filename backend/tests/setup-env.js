/**
 * Jest setupFiles — runs before any test module (and before src/config/env
 * injects .env), so a development MONGODB_URI can never win.
 *
 * It also fails fast if the mongodb driver prerequisites are missing: without
 * NODE_OPTIONS=--experimental-vm-modules, mongoose 9 + mongodb 7 handshakes
 * fail with "Missing required sub-document 'driver' in the client metadata
 * document", which otherwise surfaces as a confusing 5s beforeAll timeout.
 * `npm test` sets both flags for you.
 */
const TEST_DB_URI = 'mongodb://127.0.0.1:27017/academy_test';

process.env.MONGODB_URI = TEST_DB_URI;
process.env.NODE_ENV = 'test';

const hasVmModules =
  (process.env.NODE_OPTIONS || '').includes('--experimental-vm-modules') ||
  process.execArgv.includes('--experimental-vm-modules');

if (!hasVmModules) {
  throw new Error(
    'Tests must run with --experimental-vm-modules (the mongodb driver needs it). Run: npm test'
  );
}
