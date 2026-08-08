import { useState } from 'react';
import { Context, Task } from '../../types/domain';
import { useCompleteTask } from '../../hooks/useTasks';
import { TaskRow } from './TaskRow';
import { TaskFormModal } from './TaskFormModal';

interface TaskListProps {
  tasks: Task[];
  contexts: Context[];
  emptyLabel: string;
  hideContextChip?: boolean;
}

export function TaskList({ tasks, contexts, emptyLabel, hideContextChip }: TaskListProps) {
  const completeTask = useCompleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const contextById = new Map(contexts.map((context) => [context.id, context]));

  return (
    <>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-mist-400">{emptyLabel}</p>
        </div>
      ) : (
        <div className="focus-card px-4">
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              context={task.context_id ? contextById.get(task.context_id) : undefined}
              hideContextChip={hideContextChip}
              animationDelayMs={Math.min(index, 8) * 35}
              onToggleComplete={(t) => completeTask.mutate(t.id)}
              onEdit={setEditingTask}
            />
          ))}
        </div>
      )}

      {editingTask && (
        <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  );
}
