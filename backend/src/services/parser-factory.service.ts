import { env } from '../config/env';
import { NaturalLanguageParser, RuleBasedParser } from './ai-parser.service';
import { ClaudeParser } from './claude-parser.service';

export function createNaturalLanguageParser(): NaturalLanguageParser {
  if (env.anthropicApiKey) {
    return new ClaudeParser(env.anthropicApiKey);
  }
  return new RuleBasedParser();
}
