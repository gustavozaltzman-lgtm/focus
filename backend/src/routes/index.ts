import { Router } from 'express';
import authRoutes from './auth.routes';
import contextRoutes from './context.routes';
import taskRoutes from './task.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/contexts', contextRoutes);
router.use('/tasks', taskRoutes);

export default router;
