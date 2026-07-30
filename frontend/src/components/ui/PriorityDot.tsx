import { TaskPriority } from '../../types/domain';

const COLORS: Record<TaskPriority, string> = {
  high: 'bg-urgent',
  medium: 'bg-warn',
  low: 'bg-mist-300',
};

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${COLORS[priority]}`} />;
}
