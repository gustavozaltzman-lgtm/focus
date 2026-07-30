import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TASK_DRAG_MIME } from '../../lib/dnd';

interface DropNavLinkProps {
  to: string;
  end?: boolean;
  className: string;
  activeClassName: string;
  onDropTask: (taskId: string) => void;
  children: ReactNode;
}

export function DropNavLink({ to, end, className, activeClassName, onDropTask, children }: DropNavLinkProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(TASK_DRAG_MIME)) {
          event.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        const taskId = event.dataTransfer.getData(TASK_DRAG_MIME);
        setIsDragOver(false);
        if (taskId) onDropTask(taskId);
      }}
      className={({ isActive }) =>
        `${className} ${isActive ? activeClassName : ''} ${isDragOver ? 'ring-2 ring-signal-light ring-inset' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}
