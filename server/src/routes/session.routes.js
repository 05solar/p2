import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import {
  checkin,
  getRoster,
  updateRecord,
  closeSession,
  getLate,
} from '../controllers/session.controller.js';

const router = Router();
router.use(authRequired);

// 학생
router.post('/:id/checkin', requireRole('student'), asyncHandler(checkin));

// 교수자
router.get('/:id/roster', requireRole('professor'), asyncHandler(getRoster));
router.get('/:id/late', requireRole('professor'), asyncHandler(getLate));
router.post('/:id/close', requireRole('professor'), asyncHandler(closeSession));
router.patch('/:id/records/:studentId', requireRole('professor'), asyncHandler(updateRecord));

export default router;
