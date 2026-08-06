import { NaturalLanguageParser, RuleBasedParser } from './ai-parser.service';
import { ClaudeParser } from './claude-parser.service';
import { hasAnthropicClient } from './anthropic-client.service';

export function createNaturalLanguageParser(): NaturalLanguageParser {
  if (hasAnthropicClient()) {
    return new ClaudeParser();
  }
  return new RuleBasedParser();
}
