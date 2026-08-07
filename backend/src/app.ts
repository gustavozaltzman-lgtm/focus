import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import { apiRateLimiter } from './middlewares/rate-limiter.middleware';
import routes from './routes';

export function createApp(): Express {
  const app = express();

  // Render pone la app detrás de un único reverse proxy: sin esto,
  // express-rate-limit (y req.ip en general) ven la IP del proxy, no la del
  // cliente, y terminan limitando a todos los usuarios como si fueran uno
  // solo. "1" = confiar en el primer hop (el proxy de Render), no en
  // cualquier X-Forwarded-For que mande el cliente.
  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      // API JSON pura, sin páginas HTML propias: la CSP por defecto de
      // helmet no aplica a nada acá. Cross-Origin-Resource-Policy sí importa
      // — "same-origin" (el default) haría que el navegador descarte las
      // respuestas pedidas desde el frontend en otro origen (Vercel) aunque
      // CORS las permita, porque CORP es un mecanismo aparte de CORS.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(apiRateLimiter);

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
