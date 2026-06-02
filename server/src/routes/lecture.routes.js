import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import {
  listLectures,
  getLecture,
  createLecture,
  enrollByCode,
} from '../controllers/lecture.controller.js';
import {
  startSession,
  getActiveSession,
} from '../controllers/session.controller.js';

const router = Router();
router.use(authRequired);

router.get('/', asyncHandler(listLectures));
router.post('/', requireRole('professor'), asyncHandler(createLecture));
router.post('/enroll', requireRole('student'), asyncHandler(enrollByCode));
router.get('/:id', asyncHandler(getLecture));

// 강의에 종속된 세션 엔드포인트
router.get('/:id/sessions/active', asyncHandler(getActiveSession));
router.post('/:id/sessions', requireRole('professor'), asyncHandler(startSession));

export default router;
