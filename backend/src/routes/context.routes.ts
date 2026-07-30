import { Router } from 'express';
import * as contextController from '../controllers/context.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createContextSchema, updateContextSchema } from '../utils/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', contextController.listContexts);
router.get('/:id', contextController.getContext);
router.post('/', validateBody(createContextSchema), contextController.createContext);
router.patch('/:id', validateBody(updateContextSchema), contextController.updateContext);
router.delete('/:id', contextController.deleteContext);

export default router;
