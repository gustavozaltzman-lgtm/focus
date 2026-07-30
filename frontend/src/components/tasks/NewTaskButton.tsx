import { useState } from 'react';
import { TaskStatus } from '../../types/domain';
import { TaskFormModal } from './TaskFormModal';

interface NewTaskButtonProps {
  defaultContextId?: string;
  defaultStatus?: TaskStatus;
  label?: string;
}

export function NewTaskButton({ defaultContextId, defaultStatus, label = '+ Tarea' }: NewTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="focus-btn-primary shrink-0">
        {label}
      </button>
      {isOpen && (
        <TaskFormModal
          defaultContextId={defaultContextId}
          defaultStatus={defaultStatus}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
