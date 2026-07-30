import { Router } from 'express';
import * as pushController from '../controllers/push.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { pushSubscribeSchema, pushUnsubscribeSchema } from '../utils/schemas';

const router = Router();

router.get('/vapid-public-key', pushController.getPublicKey);

router.use(authMiddleware);

router.post('/subscribe', validateBody(pushSubscribeSchema), pushController.subscribe);
router.post('/unsubscribe', validateBody(pushUnsubscribeSchema), pushController.unsubscribe);

export default router;
