import { Router } from 'express';
import * as webauthnController from '../controllers/webauthn.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rate-limiter.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  webauthnAuthOptionsSchema,
  webauthnAuthVerifySchema,
  webauthnRegisterVerifySchema,
} from '../utils/schemas';

const router = Router();

router.get('/register/options', authMiddleware, webauthnController.getRegistrationOptions);
router.post(
  '/register/verify',
  authMiddleware,
  validateBody(webauthnRegisterVerifySchema),
  webauthnController.verifyRegistration,
);
router.get('/devices', authMiddleware, webauthnController.listDevices);
router.delete('/devices/:id', authMiddleware, webauthnController.revokeDevice);

router.post(
  '/login/options',
  authRateLimiter,
  validateBody(webauthnAuthOptionsSchema),
  webauthnController.getAuthenticationOptions,
);
router.post(
  '/login/verify',
  authRateLimiter,
  validateBody(webauthnAuthVerifySchema),
  webauthnController.verifyAuthentication,
);

export default router;
