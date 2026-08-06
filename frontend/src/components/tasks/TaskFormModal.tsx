import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { Task, TaskPriority, TaskStatus } from '../../types/domain';
import { Modal } from '../ui/Modal';
import { useContexts } from '../../hooks/useContexts';
import { useCreateTask, useDeleteTask, useUpdateTask } from '../../hooks/useTasks';
import { TaskReminders } from '../reminders/TaskReminders';
import { TaskActivityLog } from './TaskActivityLog';
import { FollowUpDraftButton } from './FollowUpDraftButton';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'today', label: 'Hoy' },
  { value: 'upcoming', label: 'Próximamente' },
  { value: 'someday', label: 'Algún día' },
  { value: 'completed', label: 'Completada' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export interface TaskDraft {
  title?: string;
  description?: string | null;
  contextId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  dueDate?: string | null;
  sourceRef?: string | null;
}

interface TaskFormModalProps {
  task?: Task;
  initialValues?: TaskDraft;
  defaultContextId?: string;
  defaultStatus?: TaskStatus;
  title_?: string;
  onClose: () => void;
}

export function TaskFormModal({
  task,
  initialValues,
  defaultContextId,
  defaultStatus,
  title_,
  onClose,
}: TaskFormModalProps) {
  const { data: contexts = [] } = useContexts();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState(task?.title ?? initialValues?.title ?? '');
  const [description, setDescription] = useState(
    task?.description ?? initialValues?.description ?? '',
  );
  const [contextId, setContextId] = useState(
    task?.context_id ?? initialValues?.contextId ?? defaultContextId ?? '',
  );
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? initialValues?.status ?? defaultStatus ?? 'inbox',
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? initialValues?.priority ?? 'medium',
  );
  const [scheduledDate, setScheduledDate] = useState(
    task?.scheduled_date ?? initialValues?.scheduledDate ?? '',
  );
  const [scheduledTime, setScheduledTime] = useState(
    (task?.scheduled_time ?? initialValues?.scheduledTime ?? '').slice(0, 5),
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? initialValues?.dueDate ?? '');
  const [sourceRef, setSourceRef] = useState(task?.source_ref ?? initialValues?.sourceRef ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isSaving = createTask.isPending || updateTask.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Ponele un título a la tarea.');
      return;
    }

    const payload = {
      title: trimmed,
      description: description.trim() || null,
      contextId: contextId || null,
      status,
      priority,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || null,
      dueDate: dueDate || null,
      sourceRef: sourceRef.trim() || null,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      const serverMessage = isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(serverMessage ?? 'No se pudo guardar la tarea. Revisá tu conexión e intentá de nuevo.');
    }
  }

  async function handleDelete() {
    if (!task) return;
    await deleteTask.mutateAsync(task.id);
    onClose();
  }

  return (
    <Modal title={title_ ?? (task ? 'Editar tarea' : 'Nueva tarea')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-ink-950">
            Título
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué hay que hacer?"
            className="focus-input"
            autoFocus
            maxLength={500}
          />
        </div>

        <div>
          <label htmlFor="task-desc" className="mb-1.5 block text-sm font-medium text-ink-950">
            Descripción <span className="text-mist-400">(opcional)</span>
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="focus-input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-context" className="mb-1.5 block text-sm font-medium text-ink-950">
              Contexto
            </label>
            <select
              id="task-context"
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="focus-input"
            >
              <option value="">Sin contexto</option>
              {contexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-ink-950">
              Prioridad
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="focus-input"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="task-date" className="mb-1.5 block text-sm font-medium text-ink-950">
              Fecha
            </label>
            <input
              id="task-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="focus-input figures"
            />
          </div>
          <div>
            <label htmlFor="task-time" className="mb-1.5 block text-sm font-medium text-ink-950">
              Hora
            </label>
            <input
              id="task-time"
              type="time"
              value={scheduledTime ?? ''}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="focus-input figures"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-ink-950">
            Fecha límite <span className="text-mist-400">(vencimiento, opcional)</span>
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="focus-input figures"
          />
        </div>

        <div>
          <label htmlFor="task-source" className="mb-1.5 block text-sm font-medium text-ink-950">
            Origen <span className="text-mist-400">(link o referencia al correo, opcional)</span>
          </label>
          <input
            id="task-source"
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
            placeholder="Ej. asunto del mail, o un link"
            className="focus-input"
            maxLength={2000}
          />
        </div>

        <div>
          <label htmlFor="task-status" className="mb-1.5 block text-sm font-medium text-ink-950">
            Estado
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="focus-input"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {task && <TaskReminders taskId={task.id} />}
        {task && <FollowUpDraftButton taskId={task.id} />}
        {task && <TaskActivityLog taskId={task.id} />}

        {error && <p className="text-sm text-urgent">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isSaving} className="focus-btn-primary flex-1">
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
          {task && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-urgent transition hover:bg-urgent/10"
            >
              Eliminar
            </button>
          )}
        </div>

        {task && confirmingDelete && (
          <div className="flex items-center justify-between rounded-lg bg-urgent/5 p-3">
            <p className="text-sm text-ink-950">¿Eliminar esta tarea?</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-mist-500 hover:bg-mist-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="rounded-lg bg-urgent px-2 py-1 text-xs font-medium text-white hover:bg-urgent/90"
              >
                {deleteTask.isPending ? 'Eliminando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
