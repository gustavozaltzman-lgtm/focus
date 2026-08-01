import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { NewTaskButton } from '../components/tasks/NewTaskButton';
import { useAuth } from '../context/AuthContext';
import { useContexts } from '../hooks/useContexts';
import { useDashboard } from '../hooks/useTasks';
import { Task } from '../types/domain';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sortByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.scheduled_date ?? '9999-99-99';
    const bDate = b.scheduled_date ?? '9999-99-99';
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    const aTime = a.scheduled_time ?? '99:99';
    const bTime = b.scheduled_time ?? '99:99';
    return aTime.localeCompare(bTime);
  });
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboard();
  const { data: contexts = [] } = useContexts();
  const firstName = user?.full_name?.split(' ')[0] ?? '';

  const todayTasks = sortByDate(summary?.todayTasks ?? []);

  return (
    <div className="space-y-4 sm:space-y-5">
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

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-mist-400">
            Foco de hoy
          </h2>
          <NewTaskButton defaultStatus="today" />
        </div>
        {isLoading ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : (
          <TaskList
            tasks={todayTasks}
            contexts={contexts}
            emptyLabel="Nada urgente hoy. Disfruta el espacio."
          />
        )}
      </div>
    </div>
  );
}
