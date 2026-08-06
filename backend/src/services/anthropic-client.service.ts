import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

type MessageParams = Anthropic.MessageCreateParamsNonStreaming;
type MessageResponse = Anthropic.Message;

const clients = env.anthropicApiKeys.map((apiKey) => new Anthropic({ apiKey }));

let nextClientIndex = 0;

export function hasAnthropicClient(): boolean {
  return clients.length > 0;
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
 */
export async function createAnthropicMessage(params: MessageParams): Promise<MessageResponse> {
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
