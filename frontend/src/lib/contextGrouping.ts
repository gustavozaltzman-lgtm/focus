import { Context, Task } from '../types/domain';

export interface ContextGroup {
  context: Context | null;
  tasks: Task[];
}

function sortByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.scheduled_date ?? '9999-99-99';
    const bDate = b.scheduled_date ?? '9999-99-99';
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    const aTime = a.scheduled_time ?? '99:99';
    const bTime = b.scheduled_time ?? '99:99';
    return aTime.localeCompare(bTime);
  });
}

export function groupByContext(tasks: Task[], contexts: Context[]): ContextGroup[] {
  const contextById = new Map(contexts.map((context) => [context.id, context]));
  const groups = new Map<string, ContextGroup>();
  const NO_CONTEXT_KEY = '__none__';

  for (const task of tasks) {
    const context = task.context_id ? contextById.get(task.context_id) ?? null : null;
    const key = context?.id ?? NO_CONTEXT_KEY;
    if (!groups.has(key)) {
      groups.set(key, { context, tasks: [] });
    }
    groups.get(key)!.tasks.push(task);
  }

  const result = Array.from(groups.values());
  for (const group of result) {
    group.tasks = sortByDate(group.tasks);
  }
  result.sort((a, b) => {
    if (!a.context) return 1;
    if (!b.context) return -1;
    return a.context.name.localeCompare(b.context.name);
  });
  return result;
}
