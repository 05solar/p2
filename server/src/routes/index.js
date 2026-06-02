import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import lectureRoutes from './lecture.routes.js';
import sessionRoutes from './session.routes.js';

const api = Router();

api.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));
api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/lectures', lectureRoutes);
api.use('/sessions', sessionRoutes);

export default api;
