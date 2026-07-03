import { Router } from 'express';
import * as attempts from '../controllers/attemptController.js';
import * as admin from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';
const router = Router(); router.use(protect);
router.get('/mine', authorize('student'), attempts.myResults);
router.get('/leaderboard/:examId', admin.leaderboard);
router.get('/:id', attempts.resultDetail);
export default router;
