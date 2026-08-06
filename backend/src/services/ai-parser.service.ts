import { Context, TaskPriority } from '../types/domain';

export interface ParsedTaskInput {
  title: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  contextId: string | null;
  contextName: string | null;
  priority: TaskPriority;
}

export interface NaturalLanguageParser {
  parse(input: string, contexts: Context[], userId?: string): Promise<ParsedTaskInput>;
}

const WEEKDAYS_ES = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'miércoles',
  'jueves',
  'viernes',
  'sabado',
  'sábado',
];

const WEEKDAY_INDEX: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  'miércoles': 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  'sábado': 6,
};

const PRIORITY_PATTERNS: Array<{ regex: RegExp; priority: TaskPriority }> = [
  { regex: /prioridad\s+alta|urgente|alta\s+prioridad/i, priority: 'high' },
  { regex: /prioridad\s+media|media\s+prioridad/i, priority: 'medium' },
  { regex: /prioridad\s+baja|baja\s+prioridad/i, priority: 'low' },
];

const TIME_REGEX = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const TIME_WORD_REGEX = /\ba las\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|hs|hrs)?\b/i;

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveWeekday(word: string, now: Date): string {
  const normalized = stripDiacritics(word.toLowerCase());
  const targetIndex = WEEKDAY_INDEX[word.toLowerCase()] ?? WEEKDAY_INDEX[normalized];
  if (targetIndex === undefined) {
    throw new Error(`Unknown weekday: ${word}`);
  }
  const result = new Date(now);
  const currentIndex = result.getDay();
  let diff = targetIndex - currentIndex;
  if (diff <= 0) diff += 7;
  result.setDate(result.getDate() + diff);
  return toISODate(result);
}

function extractDate(rawText: string, now: Date): { date: string | null; cleaned: string } {
  const lower = rawText.toLowerCase();

  if (/\bhoy\b/.test(lower)) {
    return { date: toISODate(now), cleaned: rawText.replace(/\bhoy\b/gi, '').trim() };
  }
  if (/\bmanana\b|\bmañana\b/.test(stripDiacritics(lower))) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      date: toISODate(tomorrow),
      cleaned: rawText.replace(/\bma(n|ñ)ana\b/gi, '').trim(),
    };
  }

  for (const weekday of WEEKDAYS_ES) {
    const pattern = new RegExp(`\\b(el\\s+)?${weekday}\\b`, 'i');
    if (pattern.test(rawText)) {
      const date = resolveWeekday(weekday, now);
      const cleaned = rawText.replace(pattern, '').trim();
      return { date, cleaned };
    }
  }

  const isoMatch = rawText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return { date: isoMatch[1], cleaned: rawText.replace(isoMatch[0], '').trim() };
  }

  return { date: null, cleaned: rawText };
}

function extractTime(rawText: string): { time: string | null; cleaned: string } {
  const wordMatch = rawText.match(TIME_WORD_REGEX);
  if (wordMatch) {
    let hours = Number(wordMatch[1]);
    const minutes = wordMatch[2] ?? '00';
    const meridiem = wordMatch[3]?.toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    const time = `${String(hours).padStart(2, '0')}:${minutes}`;
    return { time, cleaned: rawText.replace(wordMatch[0], '').trim() };
  }

  const directMatch = rawText.match(TIME_REGEX);
  if (directMatch) {
    return { time: `${directMatch[1].padStart(2, '0')}:${directMatch[2]}`, cleaned: rawText.replace(directMatch[0], '').trim() };
  }

  return { time: null, cleaned: rawText };
}

function extractPriority(rawText: string): { priority: TaskPriority; cleaned: string } {
  for (const { regex, priority } of PRIORITY_PATTERNS) {
    if (regex.test(rawText)) {
      return { priority, cleaned: rawText.replace(regex, '').trim() };
    }
  }
  return { priority: 'medium', cleaned: rawText };
}

function extractContext(
  rawText: string,
  contexts: Context[],
): { contextId: string | null; contextName: string | null; cleaned: string } {
  for (const context of contexts) {
    const pattern = new RegExp(`\\b(a|para|en)?\\s*${context.name}\\b`, 'i');
    if (pattern.test(rawText)) {
      return {
        contextId: context.id,
        contextName: context.name,
        cleaned: rawText.replace(pattern, '').trim(),
      };
    }
  }
  return { contextId: null, contextName: null, cleaned: rawText };
}

function cleanTitle(rawText: string): string {
  return rawText
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.-]+|[\s,.-]+$/g, '')
    .trim();
}

export class RuleBasedParser implements NaturalLanguageParser {
  async parse(input: string, contexts: Context[]): Promise<ParsedTaskInput> {
    const now = new Date();
    let working = input.trim();

    const priorityResult = extractPriority(working);
    working = priorityResult.cleaned;

    const dateResult = extractDate(working, now);
    working = dateResult.cleaned;

    const timeResult = extractTime(working);
    working = timeResult.cleaned;

    const contextResult = extractContext(working, contexts);
    working = contextResult.cleaned;

    return {
      title: cleanTitle(working) || input.trim(),
      scheduledDate: dateResult.date,
      scheduledTime: timeResult.time,
      contextId: contextResult.contextId,
      contextName: contextResult.contextName,
      priority: priorityResult.priority,
    };
  }
}

