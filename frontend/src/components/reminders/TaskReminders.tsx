import { useState } from 'react';
import { useCreateReminder, useDeleteReminder, useRemindersForTask } from '../../hooks/useReminders';

function formatReminder(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalDateTimeInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskReminders({ taskId }: { taskId: string }) {
  const { data: reminders = [] } = useRemindersForTask(taskId);
  const createReminder = useCreateReminder(taskId);
  const deleteReminder = useDeleteReminder(taskId);
  const [newTriggerAt, setNewTriggerAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pending = reminders.filter((r) => r.status !== 'sent');
  const minDateTime = toLocalDateTimeInputValue(new Date());

  function handleAdd() {
    if (!newTriggerAt) return;
    setError(null);
    if (new Date(newTriggerAt).getTime() <= Date.now()) {
      setError('Elegí una fecha y hora futura: si ya pasó, se marca como vista al instante.');
      return;
    }
    createReminder.mutate(new Date(newTriggerAt).toISOString(), {
      onSuccess: () => setNewTriggerAt(''),
      onError: () => setError('No se pudo guardar el recordatorio. Probá de nuevo.'),
    });
  }

  return (
    <div className="rounded-lg border border-mist-200 p-3">
      <p className="mb-2 text-sm font-medium text-ink-950">Recordatorios</p>

      {pending.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {pending.map((reminder) => (
            <li key={reminder.id} className="flex items-center justify-between text-sm">
              <span className="figures text-mist-500">{formatReminder(reminder.trigger_at)}</span>
              <button
                type="button"
                onClick={() => deleteReminder.mutate(reminder.id)}
                className="text-xs font-medium text-urgent hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={newTriggerAt}
          min={minDateTime}
          onChange={(e) => {
            setNewTriggerAt(e.target.value);
            setError(null);
          }}
          className="focus-input figures py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTriggerAt || createReminder.isPending}
          className="focus-btn-ghost shrink-0 border border-mist-200 px-3 py-2 text-xs"
        >
          + Avisar
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-urgent">{error}</p>}
    </div>
  );
}
