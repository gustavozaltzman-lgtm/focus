import { TaskPriority } from '../../types/domain';

const COLORS: Record<TaskPriority, string> = {
  high: 'bg-urgent',
  medium: 'bg-warn',
  low: 'bg-[#0EA5E9]',
};

const LABELS: Record<TaskPriority, string> = {
  high: 'Prioridad alta',
  medium: 'Prioridad media',
  low: 'Prioridad baja',
};

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      role="img"
      aria-label={LABELS[priority]}
      title={LABELS[priority]}
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${COLORS[priority]}`}
    />
  );
}
