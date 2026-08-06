import { FormEvent, useState } from 'react';
import * as authApi from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export function AnthropicKeyForm() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) return null;

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setStatus('working');
    setErrorMessage(null);
    try {
      const result = await authApi.setAnthropicKey(apiKey.trim());
      updateUser(result);
      setApiKey('');
      setEditing(false);
      setStatus('idle');
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'No se pudo guardar la key.';
      setErrorMessage(message);
      setStatus('error');
    }
  }

  async function handleRemove() {
    setStatus('working');
    setErrorMessage(null);
    try {
      const result = await authApi.removeAnthropicKey();
      updateUser(result);
      setStatus('idle');
    } catch {
      setErrorMessage('No se pudo quitar la key.');
      setStatus('error');
    }
  }

  return (
    <div className="px-2 py-1.5">
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
        Tu API key de Anthropic
      </p>

      {!editing && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-mist-500">
            {user.hasAnthropicKey ? `Activa · termina en ${user.anthropicKeyLast4}` : 'No configurada'}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setErrorMessage(null);
              }}
              className="rounded-md px-1.5 py-1 text-xs font-medium text-signal transition hover:bg-mist-100"
            >
              {user.hasAnthropicKey ? 'Cambiar' : 'Agregar'}
            </button>
            {user.hasAnthropicKey && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={status === 'working'}
                className="rounded-md px-1.5 py-1 text-xs font-medium text-mist-500 transition hover:bg-mist-100 disabled:opacity-60"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="flex flex-col gap-1.5">
          <input
            type="password"
            autoFocus
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-lg border border-mist-200 px-2 py-1.5 text-xs text-ink-950 outline-none focus:border-signal"
          />
          <div className="flex gap-1.5">
            <button
              type="submit"
              disabled={status === 'working' || apiKey.trim().length < 20}
              className="rounded-md bg-signal px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {status === 'working' ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setApiKey('');
                setErrorMessage(null);
              }}
              className="rounded-md px-2 py-1 text-xs font-medium text-mist-500 transition hover:bg-mist-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {errorMessage && <p className="pt-1 text-[11px] text-urgent">{errorMessage}</p>}
      <p className="pt-1 text-[10px] leading-snug text-mist-400">
        Se guarda cifrada y se usa en vez de la key compartida del servidor para tus captura con
        IA y sugerencias.
      </p>
    </div>
  );
}
