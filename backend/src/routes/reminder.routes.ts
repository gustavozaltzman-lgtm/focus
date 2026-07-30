import { Router } from 'express';
import * as reminderController from '../controllers/reminder.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { createReminderSchema, reminderQuerySchema, snoozeReminderSchema } from '../utils/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/due', reminderController.listDue);
router.get('/', validateQuery(reminderQuerySchema), reminderController.listForTask);
router.post('/', validateBody(createReminderSchema), reminderController.createReminder);
router.post('/:id/dismiss', reminderController.dismiss);
router.post('/:id/snooze', validateBody(snoozeReminderSchema), reminderController.snooze);
router.delete('/:id', reminderController.remove);

export default router;
