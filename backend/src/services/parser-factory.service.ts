import { NaturalLanguageParser } from './ai-parser.service';
import { ClaudeParser } from './claude-parser.service';

/**
 * Always returns ClaudeParser: it already falls back to RuleBasedParser on
 * any failure (no shared pool key, no personal key, network error, etc.),
 * and per-user personal keys are only known per-request via `userId`, not at
 * module load time — so the decision can't be made statically here anymore.
 */
export function createNaturalLanguageParser(): NaturalLanguageParser {
  return new ClaudeParser();
}
