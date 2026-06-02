import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import {
  getProfile,
  updateProfile,
  getAttendanceHistory,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authRequired);
router.get('/me', asyncHandler(getProfile));
router.patch('/me', asyncHandler(updateProfile));
router.get('/me/attendance', asyncHandler(getAttendanceHistory));

export default router;
