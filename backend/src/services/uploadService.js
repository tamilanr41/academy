const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');

let cloudinary = null;
if (env.cloudinaryEnabled) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE, files: 1 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype) || ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(Object.assign(new Error('Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, SVG, PDF'), { statusCode: 400 }));
  },
});

function ensureUploadDir() {
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }
  return env.UPLOAD_DIR;
}

/**
 * Stores an uploaded file with the configured provider.
 * Cloudinary when credentials exist, otherwise local disk (served at /uploads/*).
 * Returns { url, publicId, provider }.
 */
async function storeFile(file, folder = 'academy') {
  if (!file) throw Object.assign(new Error('No file provided'), { statusCode: 400 });

  if (cloudinary) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image' },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  }

  const ext = (path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`).toLowerCase().slice(0, 10);
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const dir = ensureUploadDir();
  fs.writeFileSync(path.join(dir, name), file.buffer);
  return { url: `/uploads/${name}`, publicId: '', provider: 'local' };
}

async function destroyFile(publicId) {
  if (!publicId || !cloudinary) return { deleted: false };
  try {
    await cloudinary.uploader.destroy(publicId);
    return { deleted: true };
  } catch (err) {
    console.error('[upload] destroy failed:', err.message);
    return { deleted: false };
  }
}

module.exports = { upload, storeFile, destroyFile, ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES };
