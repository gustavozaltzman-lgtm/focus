import { Modal } from '../ui/Modal';
import { TaskList } from '../tasks/TaskList';
import { useContexts } from '../../hooks/useContexts';
import { useTasks } from '../../hooks/useTasks';
import { TaskQuery } from '../../api/tasks';
import { Task } from '../../types/domain';

interface StatTasksModalProps {
  title: string;
  query: TaskQuery;
  emptyLabel: string;
  filterFn?: (task: Task) => boolean;
  onClose: () => void;
}

export function StatTasksModal({ title, query, emptyLabel, filterFn, onClose }: StatTasksModalProps) {
  const { data: fetchedTasks = [], isLoading } = useTasks(query);
  const { data: contexts = [] } = useContexts();
  const tasks = filterFn ? fetchedTasks.filter(filterFn) : fetchedTasks;

  return (
    <Modal title={title} onClose={onClose}>
      {isLoading ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : (
        <TaskList tasks={tasks} contexts={contexts} emptyLabel={emptyLabel} />
      )}
    </Modal>
  );
}
