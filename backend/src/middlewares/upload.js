import multer from 'multer';
import ApiError from '../utils/ApiError.js';
const storage = multer.diskStorage({ destination: 'uploads/', filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`) });
export const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: (_req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new ApiError(415, 'Only images are allowed')) });
