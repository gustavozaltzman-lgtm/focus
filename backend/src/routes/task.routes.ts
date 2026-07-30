import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  createTaskSchema,
  quickCaptureSchema,
  taskQuerySchema,
  updateTaskSchema,
} from '../utils/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', taskController.getDashboard);
router.get('/', validateQuery(taskQuerySchema), taskController.listTasks);
router.get('/:id', taskController.getTask);
router.post('/', validateBody(createTaskSchema), taskController.createTask);
router.post('/capture', validateBody(quickCaptureSchema), taskController.quickCapture);
router.post('/capture/preview', validateBody(quickCaptureSchema), taskController.previewCapture);
router.patch('/:id', validateBody(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
