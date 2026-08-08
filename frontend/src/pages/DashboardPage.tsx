import { useState } from 'react';
import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { NewTaskButton } from '../components/tasks/NewTaskButton';
import { FocusModeModal } from '../components/tasks/FocusModeModal';
import { SuggestNextButton } from '../components/tasks/SuggestNextButton';
import { ContextChip } from '../components/ui/ContextChip';
import { LoadingRow } from '../components/ui/LoadingRow';
import { useAuth } from '../context/AuthContext';
import { useContexts } from '../hooks/useContexts';
import { useDashboard } from '../hooks/useTasks';
import { groupByContext } from '../lib/contextGrouping';
import { sortByDate } from '../lib/taskSort';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Hora del último compromiso agendado de hoy — no conocemos cuánto dura
    cada tarea, así que "libre desde" es el punto de partida de la última,
    no el final real de tu día. */
function latestScheduledTime(tasks: { scheduled_time: string | null }[]): string | null {
  const times = tasks.map((t) => t.scheduled_time).filter((t): t is string => Boolean(t));
  if (times.length === 0) return null;
  return times.reduce((latest, t) => (t > latest ? t : latest)).slice(0, 5);
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboard();
  const { data: contexts = [] } = useContexts();
  const firstName = user?.full_name?.split(' ')[0] ?? '';
  const [focusMode, setFocusMode] = useState(false);

  const todayTasks = summary?.todayTasks ?? [];
  const todayGroups = groupByContext(todayTasks, contexts);
  const pendingTasks = sortByDate(todayTasks.filter((t) => t.status !== 'completed'));
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const freeAfter = latestScheduledTime(todayTasks);

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
        <div className="mb-2 flex flex-col gap-2 sm:mb-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-mist-400">
              Foco de hoy
            </h2>
            {todayTasks.length > 0 && (
              <p className="figures mt-0.5 text-[11px] text-mist-400">
                {completedCount} de {todayTasks.length} completadas
                {freeAfter && ` · libre desde las ${freeAfter}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pendingTasks.length > 0 && <SuggestNextButton contexts={contexts} />}
            {pendingTasks.length > 0 && (
              <button
                type="button"
                onClick={() => setFocusMode(true)}
                className="focus-btn-primary shrink-0"
              >
                Modo enfoque
              </button>
            )}
            <NewTaskButton defaultStatus="today" />
          </div>
        </div>
        {isLoading ? (
          <LoadingRow />
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

      {focusMode && (
        <FocusModeModal
          tasks={pendingTasks}
          contexts={contexts}
          onClose={() => setFocusMode(false)}
        />
      )}
    </div>
  );
}
