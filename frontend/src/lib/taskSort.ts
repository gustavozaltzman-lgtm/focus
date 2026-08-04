import { Task } from '../types/domain';

export function sortByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.scheduled_date ?? '9999-99-99';
    const bDate = b.scheduled_date ?? '9999-99-99';
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    const aTime = a.scheduled_time ?? '99:99';
    const bTime = b.scheduled_time ?? '99:99';
    return aTime.localeCompare(bTime);
  });
}
