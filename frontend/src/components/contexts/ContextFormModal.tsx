import { useState } from 'react';
import { Context } from '../../types/domain';
import { Modal } from '../ui/Modal';
import { useCreateContext, useDeleteContext, useUpdateContext } from '../../hooks/useContexts';

const PALETTE = [
  '#92400E',
  '#B5790A',
  '#0F7A57',
  '#0369A1',
  '#4338CA',
  '#A21CAF',
  '#C4372F',
  '#525252',
];

interface ContextFormModalProps {
  context?: Context;
  onClose: () => void;
}

export function ContextFormModal({ context, onClose }: ContextFormModalProps) {
  const [name, setName] = useState(context?.name ?? '');
  const [colorHex, setColorHex] = useState(context?.color_hex ?? PALETTE[0]);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const createContext = useCreateContext();
  const updateContext = useUpdateContext();
  const deleteContext = useDeleteContext();

  const isSaving = createContext.isPending || updateContext.isPending;
  const isDeleting = deleteContext.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Ponele un nombre al contexto.');
      return;
    }

    try {
      if (context) {
        await updateContext.mutateAsync({ id: context.id, name: trimmed, colorHex });
      } else {
        await createContext.mutateAsync({ name: trimmed, colorHex });
      }
      onClose();
    } catch {
      setError('No se pudo guardar. ¿El nombre ya existe?');
    }
  }

  async function handleDelete() {
    if (!context) return;
    try {
      await deleteContext.mutateAsync(context.id);
      onClose();
    } catch {
      setError('No se pudo eliminar el contexto.');
    }
  }

  return (
    <Modal title={context ? 'Editar contexto' : 'Nuevo contexto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="context-name" className="mb-1.5 block text-sm font-medium text-ink-950">
            Nombre
          </label>
          <input
            id="context-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Ej. "CDI", "DAC-WMS", "Personal"'
            className="focus-input"
            autoFocus
            maxLength={120}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-950">Color</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setColorHex(hex)}
                aria-label={`Color ${hex}`}
                aria-pressed={colorHex === hex}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  colorHex === hex ? 'border-ink-950' : 'border-transparent'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-urgent">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isSaving} className="focus-btn-primary flex-1">
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
          {context && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-urgent transition hover:bg-urgent/10"
            >
              Eliminar
            </button>
          )}
        </div>

        {context && confirmingDelete && (
          <div className="flex items-center justify-between rounded-lg bg-urgent/5 p-3">
            <p className="text-sm text-ink-950">
              ¿Eliminar "{context.name}"? Las tareas quedan sin contexto.
            </p>
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
                disabled={isDeleting}
                className="rounded-lg bg-urgent px-2 py-1 text-xs font-medium text-white hover:bg-urgent/90"
              >
                {isDeleting ? 'Eliminando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
