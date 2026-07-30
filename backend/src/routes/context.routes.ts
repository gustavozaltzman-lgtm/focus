import { Router } from 'express';
import * as contextController from '../controllers/context.controller';
import * as shareController from '../controllers/context-share.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createContextSchema, shareContextSchema, updateContextSchema } from '../utils/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/shared-with-me', shareController.listSharedWithMe);
router.get('/', contextController.listContexts);
router.get('/:id', contextController.getContext);
router.get('/:id/shared-view', shareController.getSharedView);
router.get('/:id/shares', shareController.listShares);
router.post('/', validateBody(createContextSchema), contextController.createContext);
router.post('/:id/shares', validateBody(shareContextSchema), shareController.share);
router.patch('/:id', validateBody(updateContextSchema), contextController.updateContext);
router.delete('/:id', contextController.deleteContext);
router.delete('/:id/shares/:shareId', shareController.revokeShare);

export default router;
