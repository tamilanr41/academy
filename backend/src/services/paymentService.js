const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../config/env');

let instance = null;

function getClient() {
  if (!env.razorpayEnabled) return null;
  if (!instance) {
    instance = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  }
  return instance;
}

function isConfigured() {
  return env.razorpayEnabled;
}

async function createOrder({ amountInPaise, receipt, notes = {} }) {
  const client = getClient();
  if (!client) {
    const err = new Error('Online payments are not configured. Please use the offline payment / enquiry workflow.');
    err.statusCode = 503;
    err.code = 'PAYMENTS_DISABLED';
    throw err;
  }
  return client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
  });
}

/**
 * Server-side signature verification — the browser is never trusted.
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const provided = String(signature || '');
  if (provided.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}

function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(String(expected)), Buffer.from(String(signature || '')));
  } catch {
    return false;
  }
}

module.exports = { isConfigured, createOrder, verifyPaymentSignature, verifyWebhookSignature };
