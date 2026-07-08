import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();
router.post('/admin/verify-secret', auth.verifyAdminSecret);
router.post('/google', auth.googleAuth);
router.post('/register/student/google', auth.registerStudent);
router.get('/me', protect, auth.me);
router.post('/logout', auth.logout);
router.patch('/profile', protect, upload.single('avatar'), auth.updateProfile);

export default router;
