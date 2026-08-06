import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Context } from '../../types/domain';
import { Modal } from '../ui/Modal';
import { ContextChip } from '../ui/ContextChip';
import { PriorityDot } from '../ui/PriorityDot';
import { Spinner } from '../ui/Spinner';
import { useSuggestNextTasks } from '../../hooks/useTasks';
import { FocusModeModal } from './FocusModeModal';

export function SuggestNextButton({ contexts }: { contexts: Context[] }) {
  const suggest = useSuggestNextTasks();
  const [open, setOpen] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextById = new Map(contexts.map((c) => [c.id, c]));

  function handleClick() {
    setError(null);
    setOpen(true);
    suggest.mutate(undefined, {
      onError: (err) => {
        const message = isAxiosError(err) ? err.response?.data?.error : undefined;
        setError(message ?? 'No se pudo generar la sugerencia.');
      },
    });
  }

  return (
    <>
      <button type="button" onClick={handleClick} className="focus-btn-ghost shrink-0">
        ¿Qué hago ahora?
      </button>

      {open && !focusing && (
        <Modal title="¿Qué hago ahora?" onClose={() => setOpen(false)}>
          {suggest.isPending ? (
            <div className="flex items-center gap-2 py-4 text-sm text-mist-400">
              <Spinner />
              Pensando…
            </div>
          ) : error ? (
            <p className="text-sm text-urgent">{error}</p>
          ) : suggest.data && suggest.data.tasks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-mist-500">{suggest.data.reasoning}</p>
              <div className="focus-card divide-y divide-mist-100 px-4">
                {suggest.data.tasks.map((task) => {
                  const context = task.context_id ? contextById.get(task.context_id) : undefined;
                  return (
                    <div key={task.id} className="flex items-center gap-3 py-3">
                      <PriorityDot priority={task.priority} />
                      <p className="min-w-0 flex-1 truncate text-sm text-ink-950">{task.title}</p>
                      {context && (
                        <ContextChip name={context.name} colorHex={context.color_hex} />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setFocusing(true)}
                className="focus-btn-primary w-full"
              >
                Enfocar en éstas
              </button>
            </div>
          ) : (
            <p className="text-sm text-mist-400">
              {suggest.data?.reasoning ?? 'No hay nada pendiente para sugerir.'}
            </p>
          )}
        </Modal>
      )}

      {focusing && suggest.data && (
        <FocusModeModal
          tasks={suggest.data.tasks}
          contexts={contexts}
          onClose={() => {
            setFocusing(false);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
