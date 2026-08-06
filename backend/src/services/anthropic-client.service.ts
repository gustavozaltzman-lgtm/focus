import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { getPersonalAnthropicKey, hasPersonalAnthropicKey } from './user-anthropic-key.service';

type MessageParams = Anthropic.MessageCreateParamsNonStreaming;
type MessageResponse = Anthropic.Message;

const clients = env.anthropicApiKeys.map((apiKey) => new Anthropic({ apiKey }));

let nextClientIndex = 0;

export function hasAnthropicClient(): boolean {
  return clients.length > 0;
}

/** Whether Claude is usable at all for this user: the shared server pool, or their own key. */
export async function hasAnthropicAccess(userId: string): Promise<boolean> {
  if (hasAnthropicClient()) return true;
  return hasPersonalAnthropicKey(userId);
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
 * single key the user owns and pays for themselves.
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
