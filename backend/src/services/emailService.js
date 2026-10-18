const nodemailer = require('nodemailer');
const env = require('../config/env');
const { getSettings } = require('./settingsCache');

let transporter = null;
let brandName = 'Magma Minds Academy';

function getTransporter() {
  if (!env.smtpEnabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends an email when SMTP is configured; otherwise logs to the server console.
 * Never throws â€” callers decide how to react to { delivered, skipped }.
 */
async function sendMail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[email:skipped] SMTP not configured. To: ${to} | Subject: ${subject}`);
    return { delivered: false, skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }
  try {
    const info = await transport.sendMail({ from: env.SMTP_FROM, to, subject, html, text });
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email:error] ${err.message}`);
    return { delivered: false, skipped: true, reason: 'SMTP_ERROR' };
  }
}

function wrapTemplate(title, bodyHtml) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
    <div style="border-bottom:2px solid #5C1303;padding-bottom:12px;margin-bottom:20px">
      <strong style="font-size:18px;color:#5C1303">${brandName}</strong>
    </div>
    <h2 style="margin:0 0 12px;font-size:20px">${title}</h2>
    <div style="font-size:15px;line-height:1.6">${bodyHtml}</div>
    <p style="margin-top:28px;font-size:12px;color:#6b7280">If you did not request this, you can safely ignore this email.</p>
  </div>`;
}

const templates = {
  welcome: (name) => ({
    subject: `Welcome to ${brandName}`,
    html: wrapTemplate(`Welcome, ${name}!`, `<p>Your account has been created. Log in to complete your profile, apply for courses and track your applications.</p><p style="margin-top:16px"><a href="${env.FRONTEND_URL}/login" style="background:#971F05;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Log in</a></p>`),
  }),
  verifyEmail: (name, link) => ({
    subject: 'Verify your email address',
    html: wrapTemplate('Verify your email', `<p>Hi ${name}, please confirm your email address by clicking the button below. The link expires in 24 hours.</p><p style="margin-top:16px"><a href="${link}" style="background:#971F05;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verify email</a></p>`),
  }),
  resetPassword: (name, link) => ({
    subject: 'Reset your password',
    html: wrapTemplate('Password reset requested', `<p>Hi ${name}, use the link below to set a new password. The link expires in 30 minutes.</p><p style="margin-top:16px"><a href="${link}" style="background:#971F05;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>`),
  }),
  applicationReceived: (name, reference, courseTitle) => ({
    subject: `Application received â€” ${reference}`,
    html: wrapTemplate('We received your application', `<p>Hi ${name},</p><p>Your application for <strong>${courseTitle}</strong> has been received.</p><p>Reference number: <strong>${reference}</strong></p><p>Our admissions team will contact you shortly.</p>`),
  }),
  applicationStatus: (name, reference, status) => ({
    subject: `Application update â€” ${reference}`,
    html: wrapTemplate('Application status updated', `<p>Hi ${name},</p><p>Your application <strong>${reference}</strong> is now <strong>${String(status).replace(/_/g, ' ')}</strong>.</p>`),
  }),
  enquiryReceived: (name, subject) => ({
    subject: `We received your enquiry`,
    html: wrapTemplate('Thanks for reaching out', `<p>Hi ${name},</p><p>Regarding: <strong>${subject}</strong></p><p>Our team will get back to you within one working day.</p>`),
  }),
  newsletterWelcome: () => ({
    subject: 'You are subscribed',
    html: wrapTemplate('Subscription confirmed', '<p>You are now subscribed to our newsletter. We will share course updates, events and offers.</p>'),
  }),
};

async function send(templateName, to, payload = {}) {
  const factory = templates[templateName];
  if (!factory) throw new Error(`Unknown email template: ${templateName}`);
  const settings = await getSettings().catch(() => null);
  if (settings?.academyName) brandName = settings.academyName;
  const { subject, html } = factory(payload.name || 'there', payload.link || '', payload.extra || '');
  return sendMail({ to, subject, html, text: subject });
}

module.exports = { sendMail, send, templates };
