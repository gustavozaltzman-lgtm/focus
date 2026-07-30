import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { Context, TaskPriority } from '../types/domain';
import { NaturalLanguageParser, ParsedTaskInput, RuleBasedParser } from './ai-parser.service';

const EXTRACT_TOOL_NAME = 'extract_task';

const EXTRACT_TOOL = {
  name: EXTRACT_TOOL_NAME,
  description:
    'Extrae los campos estructurados de un compromiso descrito en lenguaje natural (español o inglés).',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description:
          'Título limpio y conciso de la tarea, sin las palabras de fecha, hora, prioridad o contexto.',
      },
      scheduledDate: {
        type: ['string', 'null'],
        description:
          'Fecha en formato ISO YYYY-MM-DD si el texto menciona o implica una fecha (hoy, mañana, un día de la semana, una fecha explícita). null si no se menciona ninguna fecha.',
      },
      scheduledTime: {
        type: ['string', 'null'],
        description: 'Hora en formato 24h HH:MM si se menciona. null si no se menciona.',
      },
      contextName: {
        type: ['string', 'null'],
        description:
          'Nombre del contexto/proyecto/entidad al que pertenece la tarea, si el texto lo menciona. Debe coincidir con uno de los contextos existentes provistos cuando sea posible; si no coincide con ninguno pero el texto claramente nombra una entidad/proyecto nuevo, proponé ese nombre corto. null si no aplica.',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Prioridad implícita o explícita. "medium" si no se menciona ninguna.',
      },
    },
    required: ['title', 'scheduledDate', 'scheduledTime', 'contextName', 'priority'],
  },
};

interface ExtractToolInput {
  title: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  contextName: string | null;
  priority: TaskPriority;
}

function isExtractToolInput(value: unknown): value is ExtractToolInput {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.title === 'string' && typeof candidate.priority === 'string';
}

function todayLocalISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class ClaudeParser implements NaturalLanguageParser {
  private readonly client: Anthropic;
  private readonly fallback = new RuleBasedParser();

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async parse(input: string, contexts: Context[]): Promise<ParsedTaskInput> {
    try {
      return await this.parseWithClaude(input, contexts);
    } catch (error) {
      console.error('ClaudeParser failed, falling back to rule-based parser:', error);
      return this.fallback.parse(input, contexts);
    }
  }

  private async parseWithClaude(input: string, contexts: Context[]): Promise<ParsedTaskInput> {
    const contextNames = contexts.map((context) => context.name);
    const today = todayLocalISODate();
    const weekday = new Date().toLocaleDateString('es-ES', { weekday: 'long' });

    const message = await this.client.messages.create({
      model: env.anthropicModel,
      max_tokens: 512,
      system:
        `Hoy es ${weekday}, ${today} (formato ISO). ` +
        `Contextos existentes del usuario: ${contextNames.length > 0 ? contextNames.join(', ') : '(ninguno todavía)'}. ` +
        'Interpretá el texto del usuario y llamá a la herramienta extract_task con los campos extraídos.',
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: EXTRACT_TOOL_NAME },
      messages: [{ role: 'user', content: input }],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse || !isExtractToolInput(toolUse.input)) {
      throw new Error('Claude response did not include a valid extract_task tool call');
    }

    const parsed = toolUse.input;
    const matchedContext = contexts.find(
      (context) => context.name.toLowerCase() === (parsed.contextName ?? '').toLowerCase(),
    );

    return {
      title: parsed.title.trim() || input.trim(),
      scheduledDate: parsed.scheduledDate,
      scheduledTime: parsed.scheduledTime,
      contextId: matchedContext?.id ?? null,
      contextName: matchedContext?.name ?? parsed.contextName,
      priority: parsed.priority,
    };
  }
}
