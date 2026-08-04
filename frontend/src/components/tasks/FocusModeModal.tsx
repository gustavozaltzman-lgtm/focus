import { useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { Context, Task } from '../../types/domain';
import { Modal } from '../ui/Modal';
import { ContextChip } from '../ui/ContextChip';
import { PriorityDot } from '../ui/PriorityDot';
import { ReminderIcon } from '../ui/ReminderIcon';
import { useCompleteTask } from '../../hooks/useTasks';
import { TaskFormModal } from './TaskFormModal';

interface FocusModeModalProps {
  tasks: Task[];
  contexts: Context[];
  onClose: () => void;
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function FocusModeModal({ tasks, contexts, onClose }: FocusModeModalProps) {
  const [queue] = useState(tasks);
  const [index, setIndex] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const completeTask = useCompleteTask();

  const contextById = new Map(contexts.map((c) => [c.id, c]));
  const current = queue[index];
  const done = index >= queue.length;

  function goNext() {
    setIndex((i) => i + 1);
  }

  function goBack() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  function handleComplete() {
    if (!current) return;
    completeTask.mutate(current.id, { onSuccess: goNext });
  }

  const SWIPE_THRESHOLD = 90;

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      goNext();
    } else if (info.offset.x >= SWIPE_THRESHOLD && index > 0) {
      goBack();
    }
  }

  const context = current?.context_id ? contextById.get(current.context_id) : undefined;

  return (
    <>
      <Modal title="Modo enfoque" onClose={onClose}>
        {!done && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-mist-400">
              <span>
                Tarea {index + 1} de {queue.length}
              </span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="font-medium text-mist-500 transition hover:text-ink-950"
                >
                  ← Anterior
                </button>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist-100">
              <div
                className="h-full rounded-full bg-signal transition-all duration-300"
                style={{ width: `${(index / queue.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <div className="animate-pop flex h-14 w-14 items-center justify-center rounded-full bg-calm text-white">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                  <path
                    d="M4 13l5 5L20 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-base font-semibold text-ink-950">¡Repasaste todo!</p>
              <p className="text-sm text-mist-500">
                {queue.length} {queue.length === 1 ? 'tarea revisada' : 'tareas revisadas'}.
              </p>
              <div className="mt-2 flex items-center gap-2">
                {queue.length > 0 && (
                  <button type="button" onClick={goBack} className="focus-btn-ghost">
                    ← Anterior
                  </button>
                )}
                <button type="button" onClick={onClose} className="focus-btn-primary px-6">
                  Cerrar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              whileDrag={{ scale: 1.02 }}
              onDragEnd={handleDragEnd}
              className="cursor-grab touch-pan-y rounded-xl2 border border-mist-200 p-5 active:cursor-grabbing"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PriorityDot priority={current.priority} />
                  {context && <ContextChip name={context.name} colorHex={context.color_hex} />}
                  {current.has_reminder && <ReminderIcon />}
                </div>
                {current.scheduled_date && (
                  <span className="figures text-xs text-mist-400">
                    {formatDate(current.scheduled_date)}
                    {current.scheduled_time && ` · ${current.scheduled_time.slice(0, 5)}`}
                  </span>
                )}
              </div>

              <p className="text-lg font-semibold leading-snug text-ink-950">{current.title}</p>
              {current.description && (
                <p className="mt-2 text-sm leading-relaxed text-mist-500">{current.description}</p>
              )}

              <div className="mt-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completeTask.isPending}
                  className="focus-btn-primary flex-1"
                >
                  Completar
                </button>
                <button type="button" onClick={goNext} className="focus-btn-ghost">
                  Más tarde
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(current)}
                  className="focus-btn-ghost"
                >
                  Editar
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-mist-400">
                Deslizá ← para pasar a la siguiente, → para volver
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {editingTask && (
        <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  );
}
