import { useState } from 'react';
import { StatTile } from '../components/dashboard/StatTile';
import { StatTasksModal } from '../components/dashboard/StatTasksModal';
import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { NewTaskButton } from '../components/tasks/NewTaskButton';
import { ContextChip } from '../components/ui/ContextChip';
import { useAuth } from '../context/AuthContext';
import { useContexts } from '../hooks/useContexts';
import { useDashboard } from '../hooks/useTasks';
import { groupByContext } from '../lib/contextGrouping';

type StatFilter = 'urgent' | 'scheduled' | 'inbox' | 'overdue' | 'completedWeek' | null;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday.toISOString();
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboard();
  const { data: contexts = [] } = useContexts();
  const [statFilter, setStatFilter] = useState<StatFilter>(null);
  const firstName = user?.full_name?.split(' ')[0] ?? '';

  const todayGroups = groupByContext(summary?.todayTasks ?? [], contexts);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-ink-950 sm:text-xl">
          {greeting()}, {firstName}
        </h1>
        <p className="figures shrink-0 text-xs text-mist-400">
          {capitalizeFirst(
            new Date().toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          )}
        </p>
      </div>

      <div>
        <QuickCaptureBar />
        <p className="mt-1 px-1 text-[10px] text-mist-400">Powered by Claude AI</p>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {[
          { label: 'Urgentes', value: summary?.urgentCount ?? 0, accent: 'text-urgent', filter: 'urgent' as const },
          { label: 'Programadas', value: summary?.scheduledCount ?? 0, accent: 'text-warn', filter: 'scheduled' as const },
          { label: 'Ideas', value: summary?.inboxCount ?? 0, accent: 'text-mist-500', filter: 'inbox' as const },
          { label: 'Vencidas', value: summary?.overdueCount ?? 0, accent: 'text-urgent', filter: 'overdue' as const },
          { label: 'Resueltas', value: summary?.completedThisWeekCount ?? 0, accent: 'text-calm', filter: 'completedWeek' as const },
        ].map((tile, index) => (
          <div key={tile.filter} className="animate-fade-in-up" style={{ animationDelay: `${index * 45}ms` }}>
            <StatTile
              label={tile.label}
              value={tile.value}
              accentClassName={tile.accent}
              onClick={() => setStatFilter(tile.filter)}
            />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-mist-400">
            Foco de hoy
          </h2>
          <NewTaskButton defaultStatus="today" />
        </div>
        {isLoading ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : todayGroups.length === 0 ? (
          <TaskList tasks={[]} contexts={contexts} emptyLabel="Nada urgente hoy. Disfruta el espacio." />
        ) : (
          <div className="space-y-3">
            {todayGroups.map((group) => (
              <div key={group.context?.id ?? 'sin-contexto'}>
                <div className="mb-1">
                  {group.context ? (
                    <ContextChip name={group.context.name} colorHex={group.context.color_hex} />
                  ) : (
                    <span className="text-xs font-medium text-mist-400">Sin contexto</span>
                  )}
                </div>
                <TaskList tasks={group.tasks} contexts={contexts} emptyLabel="" hideContextChip />
              </div>
            ))}
          </div>
        )}
      </div>

      {statFilter === 'urgent' && (
        <StatTasksModal
          title="Urgentes"
          query={{ priority: 'high', excludeCompleted: true, pageSize: 100 }}
          emptyLabel="No hay tareas urgentes."
          onClose={() => setStatFilter(null)}
        />
      )}
      {statFilter === 'scheduled' && (
        <StatTasksModal
          title="Programadas"
          query={{ status: 'upcoming', pageSize: 100 }}
          emptyLabel="No hay tareas programadas."
          onClose={() => setStatFilter(null)}
        />
      )}
      {statFilter === 'inbox' && (
        <StatTasksModal
          title="Ideas"
          query={{ status: 'inbox', pageSize: 100 }}
          emptyLabel="El inbox está vacío."
          onClose={() => setStatFilter(null)}
        />
      )}
      {statFilter === 'overdue' && (
        <StatTasksModal
          title="Vencidas"
          query={{ excludeCompleted: true, pageSize: 100 }}
          emptyLabel="No hay tareas vencidas."
          filterFn={(task) => Boolean(task.scheduled_date) && task.scheduled_date! < todayISO()}
          onClose={() => setStatFilter(null)}
        />
      )}
      {statFilter === 'completedWeek' && (
        <StatTasksModal
          title="Resueltas esta semana"
          query={{ status: 'completed', pageSize: 100 }}
          emptyLabel="Todavía no resolviste nada esta semana."
          filterFn={(task) => Boolean(task.completed_at) && task.completed_at! >= startOfWeekISO()}
          onClose={() => setStatFilter(null)}
        />
      )}
    </div>
  );
}
