import { useParams } from 'react-router-dom';
import { useSharedContextView } from '../hooks/useContextShares';
import { ContextChip } from '../components/ui/ContextChip';
import { PriorityDot } from '../components/ui/PriorityDot';
import { ReminderIcon } from '../components/ui/ReminderIcon';

export function SharedContextPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSharedContextView(id);

  if (isLoading) return <p className="text-sm text-mist-400">Cargando…</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <ContextChip name={data.context.name} colorHex={data.context.color_hex} />
          <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[11px] font-medium text-mist-500">
            Solo lectura
          </span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink-950 sm:text-[32px]">
          {data.context.name}
        </h1>
        <p className="mt-1 text-sm text-mist-500">Compartido por {data.ownerName}.</p>
      </div>

      {data.tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-mist-400">No hay compromisos activos en este contexto.</p>
        </div>
      ) : (
        <div className="focus-card px-4">
          {data.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 border-b border-mist-100 py-3 pl-3 pr-1 last:border-b-0"
            >
              <span className="h-5 w-5 shrink-0 rounded-full border border-mist-300" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] text-ink-950">{task.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-mist-400">
                  {task.has_reminder && <ReminderIcon />}
                  {task.scheduled_date && (
                    <span className="figures">
                      {new Date(`${task.scheduled_date}T00:00:00`).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                  {task.scheduled_time && <span className="figures">{task.scheduled_time}</span>}
                </div>
              </div>
              <PriorityDot priority={task.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
