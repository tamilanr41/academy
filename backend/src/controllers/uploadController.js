const asyncHandler = require('../utils/asyncHandler');
const { created, success } = require('../utils/response');
const ApiError = require('../utils/ApiError');
const { storeFile, destroyFile } = require('../services/uploadService');
const auditService = require('../services/auditService');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file provided. Send the file as multipart/form-data field "file".');
  const folder = String(req.query.folder || req.body.folder || 'academy').replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 60) || 'academy';
  const result = await storeFile(req.file, `academy/${folder}`);

  await auditService.log({ actor: req.user, action: 'upload.create', entity: 'Upload', entityId: result.publicId || result.url, summary: `Uploaded ${req.file.originalname} (${result.provider})`, req });
  return created(res, { ...result, name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype }, 'File uploaded');
});

const deleteUpload = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required for remote files');
  const result = await destroyFile(publicId);
  await auditService.log({ actor: req.user, action: 'upload.delete', entity: 'Upload', entityId: publicId, summary: 'Deleted uploaded file', req });
  return success(res, result, result.deleted ? 'File deleted' : 'File could not be deleted remotely (local files are removed with the record)');
});

module.exports = { uploadImage, deleteUpload };
