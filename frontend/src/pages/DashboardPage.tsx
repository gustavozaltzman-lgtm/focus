import { StatTile } from '../components/dashboard/StatTile';
import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { useAuth } from '../context/AuthContext';
import { useContexts } from '../hooks/useContexts';
import { useDashboard } from '../hooks/useTasks';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboard();
  const { data: contexts = [] } = useContexts();
  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-mist-500">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <QuickCaptureBar />

      <div className="flex gap-3">
        <StatTile label="Urgentes" value={summary?.urgentCount ?? 0} accentClassName="text-urgent" />
        <StatTile
          label="Programadas"
          value={summary?.scheduledCount ?? 0}
          accentClassName="text-warn"
        />
        <StatTile label="Ideas (inbox)" value={summary?.inboxCount ?? 0} accentClassName="text-mist-500" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mist-400">
          Foco de hoy
        </h2>
        {isLoading ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : (
          <TaskList
            tasks={summary?.todayTasks ?? []}
            contexts={contexts}
            emptyLabel="Nada urgente hoy. Disfruta el espacio."
          />
        )}
      </div>
    </div>
  );
}
