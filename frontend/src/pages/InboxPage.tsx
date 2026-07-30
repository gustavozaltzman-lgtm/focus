import { QuickCaptureBar } from '../components/capture/QuickCaptureBar';
import { TaskList } from '../components/tasks/TaskList';
import { useContexts } from '../hooks/useContexts';
import { useTasks } from '../hooks/useTasks';

export function InboxPage() {
  const { data: tasks = [], isLoading } = useTasks({ status: 'inbox' });
  const { data: contexts = [] } = useContexts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[28px] text-ink-950 sm:text-[32px]">Inbox</h1>
        <p className="mt-1 text-sm text-mist-500">Captura sin clasificar. Procesa cuando quieras.</p>
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
