import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';
const router = Router(); router.use(protect, authorize('admin'));
router.get('/dashboard', admin.dashboard); router.get('/students', admin.students); router.get('/results', admin.results);
export default router;
