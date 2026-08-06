import * as userRepo from '../repositories/user.repository';
import { AppError } from '../middlewares/error-handler.middleware';
import { decrypt, encrypt, hasEncryptionKey } from './crypto.service';

function requireEncryptionConfigured(): void {
  if (!hasEncryptionKey()) {
    throw new AppError(
      'El servidor no tiene ENCRYPTION_KEY configurada; no se pueden guardar API keys personales por ahora.',
      503,
    );
  }
}

export async function setPersonalAnthropicKey(
  userId: string,
  rawApiKey: string,
): Promise<{ last4: string }> {
  requireEncryptionConfigured();
  const apiKey = rawApiKey.trim();
  if (!apiKey.startsWith('sk-ant-')) {
    throw new AppError('La API key no tiene el formato esperado de Anthropic (sk-ant-...).', 422);
  }

  const last4 = apiKey.slice(-4);
  await userRepo.setUserAnthropicKey(userId, encrypt(apiKey), last4);
  return { last4 };
}

export async function clearPersonalAnthropicKey(userId: string): Promise<void> {
  await userRepo.clearUserAnthropicKey(userId);
}

export async function hasPersonalAnthropicKey(userId: string): Promise<boolean> {
  const user = await userRepo.findUserById(userId);
  return Boolean(user?.anthropic_api_key_encrypted);
}

export async function getPersonalAnthropicKey(userId: string): Promise<string | null> {
  const user = await userRepo.findUserById(userId);
  if (!user?.anthropic_api_key_encrypted) return null;
  try {
    return decrypt(user.anthropic_api_key_encrypted);
  } catch (error) {
    console.error(`Failed to decrypt Anthropic key for user ${userId}:`, error);
    return null;
  }
}
