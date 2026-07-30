import { useParams } from 'react-router-dom';
import { ContextChip } from '../components/ui/ContextChip';
import { TaskList } from '../components/tasks/TaskList';
import { useContext_, useContexts } from '../hooks/useContexts';
import { useTasks } from '../hooks/useTasks';

export function ContextPage() {
  const { id } = useParams<{ id: string }>();
  const { data: context } = useContext_(id);
  const { data: contexts = [] } = useContexts();
  const { data: tasks = [], isLoading } = useTasks({ contextId: id });

  if (!context) return null;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2">
          <ContextChip name={context.name} colorHex={context.color_hex} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{context.name}</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : (
        <TaskList
          tasks={tasks}
          contexts={contexts}
          emptyLabel="No hay compromisos en este contexto."
        />
      )}
    </div>
  );
}
