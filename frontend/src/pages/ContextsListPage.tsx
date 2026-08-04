import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../types/domain';
import { useContexts } from '../hooks/useContexts';
import { ContextFormModal } from '../components/contexts/ContextFormModal';
import { LoadingRow } from '../components/ui/LoadingRow';

export function ContextsListPage() {
  const { data: contexts = [], isLoading } = useContexts();
  const [editing, setEditing] = useState<Context | 'new' | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-ink-950 sm:text-[32px]">
            Contextos
          </h1>
          <p className="mt-1 text-sm text-mist-500">Tus proyectos y entidades activas.</p>
        </div>
        <button onClick={() => setEditing('new')} className="focus-btn-primary shrink-0">
          + Nuevo
        </button>
      </div>

      {isLoading ? (
        <LoadingRow />
      ) : contexts.length === 0 ? (
        <div className="focus-card px-6 py-10 text-center">
          <p className="text-sm text-mist-400">
            Todavía no tenés contextos. Creá uno para agrupar tus compromisos por proyecto o
            entidad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contexts.map((context) => (
            <div key={context.id} className="focus-card flex items-center gap-3 p-4">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: context.color_hex }}
              />
              <Link to={`/contexts/${context.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-950">{context.name}</p>
                <p className="figures text-xs text-mist-400">
                  {context.active_task_count ?? 0} activas
                </p>
              </Link>
              <button
                onClick={() => setEditing(context)}
                aria-label={`Editar ${context.name}`}
                className="shrink-0 rounded-lg p-2 text-mist-400 transition hover:bg-mist-100 hover:text-ink-950"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ContextFormModal
          context={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
