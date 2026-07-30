import { AnimatePresence, motion } from 'framer-motion';
import { Context, Task } from '../../types/domain';
import { PriorityDot } from '../ui/PriorityDot';
import { ContextChip } from '../ui/ContextChip';
import { ReminderIcon } from '../ui/ReminderIcon';
import { TASK_DRAG_MIME } from '../../lib/dnd';

interface TaskRowProps {
  task: Task;
  context?: Context;
  hideContextChip?: boolean;
  animationDelayMs?: number;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
}

export function TaskRow({
  task,
  context,
  hideContextChip,
  animationDelayMs = 0,
  onToggleComplete,
  onEdit,
}: TaskRowProps) {
  const isCompleted = task.status === 'completed';
  const edgeColor = context?.color_hex ?? '#D2CDC0';

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(TASK_DRAG_MIME, task.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className="group flex animate-fade-in-up cursor-grab items-center gap-3 border-b border-mist-100 py-2 pl-3 pr-1 last:border-b-0 active:cursor-grabbing"
      style={{ boxShadow: `inset 3px 0 0 0 ${edgeColor}`, animationDelay: `${animationDelayMs}ms` }}
    >
      <button
        onClick={() => onToggleComplete(task)}
        aria-label={isCompleted ? 'Marcar como pendiente' : 'Completar tarea'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
          isCompleted
            ? 'border-calm bg-calm text-white'
            : 'border-mist-300 group-hover:border-ink-950'
        }`}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
            >
              <path
                d="M2 6.5L4.5 9L10 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      <button
        onClick={() => onEdit(task)}
        className="min-w-0 flex-1 cursor-pointer text-left"
        aria-label={`Editar ${task.title}`}
      >
        <p className={`truncate text-[15px] ${isCompleted ? 'text-mist-400 line-through' : 'text-ink-950'}`}>
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-mist-400">
          {task.has_reminder && <ReminderIcon />}
          {task.scheduled_date && <span className="figures">{formatDate(task.scheduled_date)}</span>}
          {task.scheduled_time && <span className="figures">{task.scheduled_time.slice(0, 5)}</span>}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2.5">
        {context && !hideContextChip && <ContextChip name={context.name} colorHex={context.color_hex} />}
        <PriorityDot priority={task.priority} />
      </div>
    </div>
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}
