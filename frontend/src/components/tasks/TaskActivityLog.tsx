import { useTaskActivity } from '../../hooks/useActivity';

const ACTION_LABELS: Record<string, string> = {
  created: 'Creada',
  created_via_capture: 'Creada por captura rápida',
  updated: 'Editada',
  completed: 'Completada',
  deleted: 'Eliminada',
  reminder_created: 'Recordatorio agregado',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TaskActivityLog({ taskId }: { taskId: string }) {
  const { data: activity = [] } = useTaskActivity(taskId);

  if (activity.length === 0) return null;

  return (
    <details className="rounded-lg border border-mist-200 p-3">
      <summary className="cursor-pointer text-sm font-medium text-ink-950">
        Historial ({activity.length})
      </summary>
      <ul className="mt-2 space-y-1">
        {activity.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between text-xs text-mist-500">
            <span>{ACTION_LABELS[entry.action] ?? entry.action}</span>
            <span className="figures">{formatWhen(entry.created_at)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
