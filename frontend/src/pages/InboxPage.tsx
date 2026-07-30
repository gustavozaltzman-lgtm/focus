import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { NewTaskButton } from '../components/tasks/NewTaskButton';
import { useContexts } from '../hooks/useContexts';
import { useTasks } from '../hooks/useTasks';

export function InboxPage() {
  const { data: tasks = [], isLoading } = useTasks({ status: 'inbox' });
  const { data: contexts = [] } = useContexts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-ink-950 sm:text-[32px]">Inbox</h1>
          <p className="mt-1 text-sm text-mist-500">Captura sin clasificar. Procesa cuando quieras.</p>
        </div>
        <NewTaskButton defaultStatus="inbox" />
      </div>

      <QuickCaptureBar />

      {isLoading ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : (
        <TaskList tasks={tasks} contexts={contexts} emptyLabel="Tu inbox está vacío." />
      )}
    </div>
  );
}
