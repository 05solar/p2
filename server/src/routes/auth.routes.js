import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { register, login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authRequired, asyncHandler(me));

export default router;
