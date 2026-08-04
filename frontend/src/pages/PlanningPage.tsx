import { TaskList } from '../components/tasks/TaskList';
import { LoadingRow } from '../components/ui/LoadingRow';
import { useContexts } from '../hooks/useContexts';
import { useTasks } from '../hooks/useTasks';
import { groupByWeek } from '../lib/weekGrouping';

export function PlanningPage() {
  const { data: upcoming = [], isLoading: isLoadingUpcoming } = useTasks({ status: 'upcoming' });
  const { data: someday = [], isLoading: isLoadingSomeday } = useTasks({ status: 'someday' });
  const { data: contexts = [] } = useContexts();

  const weekGroups = groupByWeek(upcoming);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink-950 sm:text-[32px]">
          Planificación
        </h1>
        <p className="mt-1 text-sm text-mist-500">Lo que viene, y lo que puede esperar.</p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mist-400">
          Próximamente
        </h2>
        {isLoadingUpcoming ? (
          <LoadingRow />
        ) : weekGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-mist-400">Nada programado todavía.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weekGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-medium text-mist-400">{group.label}</p>
                <TaskList
                  tasks={group.tasks}
                  contexts={contexts}
                  emptyLabel=""
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mist-400">
          Algún día
        </h2>
        {isLoadingSomeday ? (
          <LoadingRow />
        ) : (
          <TaskList
            tasks={someday}
            contexts={contexts}
            emptyLabel="Sin ideas guardadas para más adelante."
          />
        )}
      </div>
    </div>
  );
}
