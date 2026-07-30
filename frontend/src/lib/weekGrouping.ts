import { Task } from '../types/domain';

function mondayOf(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export interface WeekGroup {
  label: string;
  tasks: Task[];
}

export function groupByWeek(tasks: Task[]): WeekGroup[] {
  const today = new Date();
  const thisWeekStart = mondayOf(today);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const weekAfterStart = new Date(thisWeekStart);
  weekAfterStart.setDate(weekAfterStart.getDate() + 14);

  const buckets: Record<string, Task[]> = {
    'Esta semana': [],
    'Próxima semana': [],
    'Más adelante': [],
    'Sin fecha': [],
  };

  for (const task of tasks) {
    if (!task.scheduled_date) {
      buckets['Sin fecha'].push(task);
      continue;
    }
    const date = new Date(`${task.scheduled_date}T00:00:00`);
    if (date < nextWeekStart) {
      buckets['Esta semana'].push(task);
    } else if (date < weekAfterStart) {
      buckets['Próxima semana'].push(task);
    } else {
      buckets['Más adelante'].push(task);
    }
  }

  return Object.entries(buckets)
    .filter(([, tasks]) => tasks.length > 0)
    .map(([label, tasks]) => ({ label, tasks }));
}
