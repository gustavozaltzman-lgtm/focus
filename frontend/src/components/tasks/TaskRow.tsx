import { AnimatePresence, motion, PanInfo } from 'framer-motion';
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
  onDelete: (task: Task) => void;
}

const SWIPE_THRESHOLD = 88;

export function TaskRow({
  task,
  context,
  hideContextChip,
  animationDelayMs = 0,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const isCompleted = task.status === 'completed';
  const edgeColor = context?.color_hex ?? '#D2CDC0';

  function handleSwipeEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x >= SWIPE_THRESHOLD) {
      onToggleComplete(task);
    } else if (info.offset.x <= -SWIPE_THRESHOLD) {
      onDelete(task);
    }
  }

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(TASK_DRAG_MIME, task.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className="relative cursor-grab overflow-hidden active:cursor-grabbing"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      {/* Revealed behind the row while swiping — never visible otherwise. */}
      <div className="absolute inset-0 flex items-stretch justify-between" aria-hidden="true">
        <div className="flex items-center gap-1.5 bg-calm pl-4 text-xs font-semibold text-white">
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isCompleted ? 'Pendiente' : 'Completar'}
        </div>
        <div className="flex items-center gap-1.5 bg-urgent pr-4 text-xs font-semibold text-white">
          Eliminar
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path
              d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5V13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.85}
        onDragEnd={handleSwipeEnd}
        className="group flex animate-fade-in-up items-center gap-3 border-b border-mist-100 bg-surface py-2 pl-3 pr-1 last:border-b-0"
        style={{ boxShadow: `inset 3px 0 0 0 ${edgeColor}` }}
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
            {task.due_date && (
              <span
                className={`figures ${isDueSoon(task.due_date) ? 'font-medium text-urgent' : ''}`}
              >
                vence {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2.5">
          {context && !hideContextChip && <ContextChip name={context.name} colorHex={context.color_hex} />}
          <PriorityDot priority={task.priority} />
        </div>
      </motion.div>
    </div>
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}

function isDueSoon(dueDate: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dueDate <= today;
}
