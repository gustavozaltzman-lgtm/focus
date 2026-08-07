import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { findUserById } from '../repositories/user.repository';
import { getPersonalAnthropicKey, hasPersonalAnthropicKey } from './user-anthropic-key.service';

type MessageParams = Anthropic.MessageCreateParamsNonStreaming;
type MessageResponse = Anthropic.Message;

const clients = env.anthropicApiKeys.map((apiKey) => new Anthropic({ apiKey }));

let nextClientIndex = 0;

export function hasAnthropicClient(): boolean {
  return clients.length > 0;
}

/**
 * El pool compartido del servidor (ANTHROPIC_API_KEYS) sale de la cuenta de
 * Anthropic de quien lo configuró — no de cada usuario. Para que otros
 * usuarios de la app no consuman ese saldo sin saberlo, el fallback al pool
 * queda reservado solo para ANTHROPIC_POOL_OWNER_EMAIL (si está configurada).
 * Sin esa variable, nadie cae al pool sin key propia — hay que cargar una
 * key personal.
 */
async function isSharedPoolOwner(userId: string): Promise<boolean> {
  if (!env.anthropicPoolOwnerEmail) return false;
  const user = await findUserById(userId);
  return user?.email.toLowerCase() === env.anthropicPoolOwnerEmail;
}

/** Whether Claude is usable at all for this user: their own key, or the shared pool if they own it. */
export async function hasAnthropicAccess(userId: string): Promise<boolean> {
  if (await hasPersonalAnthropicKey(userId)) return true;
  return hasAnthropicClient() && isSharedPoolOwner(userId);
}

function isRetryableWithAnotherKey(error: unknown): boolean {
  if (!(error instanceof Anthropic.APIError)) return false;
  const status = error.status ?? 0;
  // 401/403: this key is invalid; 429: this key is rate-limited/out of credit;
  // 5xx: transient upstream error. All worth retrying with a different key.
  return status === 401 || status === 403 || status === 429 || status >= 500;
}

/**
 * Sends a message using the pool of configured Anthropic API keys.
 * Distributes calls round-robin across keys, and fails over to the next
 * key (in order) if the current one is rate-limited, invalid, or erroring —
 * so a single exhausted/misconfigured key doesn't take the feature down.
 *
 * If `userId` is given and that user has their own Anthropic key configured,
 * it's used instead of the shared pool — no rotation/failover, since it's a
 * single key the user owns and pays for themselves. If they don't have one,
 * the shared pool is only used when they're the pool's owner (see
 * `isSharedPoolOwner`) — everyone else gets no Claude access until they add
 * their own key, so nobody else's usage bills to the pool owner's account.
 */
export async function createAnthropicMessage(
  params: MessageParams,
  userId?: string,
): Promise<MessageResponse> {
  if (userId) {
    const personalKey = await getPersonalAnthropicKey(userId);
    if (personalKey) {
      return new Anthropic({ apiKey: personalKey }).messages.create(params);
    }
    if (!(await isSharedPoolOwner(userId))) {
      throw new Error('Este usuario no tiene una API key de Anthropic propia configurada');
    }
  }

  if (clients.length === 0) {
    throw new Error('No hay ninguna ANTHROPIC_API_KEY configurada');
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < clients.length; attempt++) {
    const index = (nextClientIndex + attempt) % clients.length;
    try {
      const result = await clients[index].messages.create(params);
      nextClientIndex = (index + 1) % clients.length;
      return result;
    } catch (error) {
      lastError = error;
      if (!isRetryableWithAnotherKey(error)) throw error;
      console.error(
        `Anthropic key #${index + 1}/${clients.length} failed (${
          error instanceof Anthropic.APIError ? error.status : 'unknown'
        }), trying next key:`,
        error,
      );
    }
  }
  throw lastError;
}
