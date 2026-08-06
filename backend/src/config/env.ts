import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  anthropicApiKeys: string[];
  anthropicModel: string;
  webauthnRpId: string;
  webauthnRpName: string;
  webauthnOrigin: string;
  vapidPublicKey: string | undefined;
  vapidPrivateKey: string | undefined;
  vapidSubject: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function deriveDefaultRpId(origin: string): string {
  try {
    return new URL(origin).hostname;
  } catch {
    return 'localhost';
  }
}

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

function parseAnthropicApiKeys(): string[] {
  const list = process.env.ANTHROPIC_API_KEYS;
  if (list) {
    return list
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }
  const single = process.env.ANTHROPIC_API_KEY;
  return single ? [single] : [];
}

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin,
  anthropicApiKeys: parseAnthropicApiKeys(),
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
  webauthnRpId: process.env.WEBAUTHN_RP_ID ?? deriveDefaultRpId(corsOrigin),
  webauthnRpName: process.env.WEBAUTHN_RP_NAME ?? 'Focus',
  webauthnOrigin: process.env.WEBAUTHN_ORIGIN ?? corsOrigin,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:no-reply@focus.app',
};
