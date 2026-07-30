import { Context, Task } from '../../types/domain';
import { useCompleteTask } from '../../hooks/useTasks';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  contexts: Context[];
  emptyLabel: string;
}

export function TaskList({ tasks, contexts, emptyLabel }: TaskListProps) {
  const completeTask = useCompleteTask();
  const contextById = new Map(contexts.map((context) => [context.id, context]));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-mist-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="focus-card px-4">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          context={task.context_id ? contextById.get(task.context_id) : undefined}
          onToggleComplete={(t) => completeTask.mutate(t.id)}
        />
      ))}
    </div>
  );
}
