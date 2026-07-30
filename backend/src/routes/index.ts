import { Router } from 'express';
import authRoutes from './auth.routes';
import contextRoutes from './context.routes';
import reminderRoutes from './reminder.routes';
import taskRoutes from './task.routes';
import webauthnRoutes from './webauthn.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/contexts', contextRoutes);
router.use('/tasks', taskRoutes);
router.use('/reminders', reminderRoutes);
router.use('/webauthn', webauthnRoutes);

export default router;
