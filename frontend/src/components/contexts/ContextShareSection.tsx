import { useState } from 'react';
import { useCreateShare, useRevokeShare, useShares } from '../../hooks/useContextShares';

export function ContextShareSection({ contextId }: { contextId: string }) {
  const { data: shares = [] } = useShares(contextId);
  const createShare = useCreateShare(contextId);
  const revokeShare = useRevokeShare(contextId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    createShare.mutate(trimmed, {
      onSuccess: () => setEmail(''),
      onError: () => setError('No se pudo compartir. Verificá el email o si ya lo compartiste.'),
    });
  }

  return (
    <div className="rounded-lg border border-mist-200 p-3">
      <p className="mb-2 text-sm font-medium text-ink-950">
        Compartir (solo lectura)
      </p>

      {shares.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {shares.map((share) => (
            <li key={share.id} className="flex items-center justify-between text-sm">
              <span className="text-mist-500">{share.shared_with_email}</span>
              <button
                type="button"
                onClick={() => revokeShare.mutate(share.id)}
                className="text-xs font-medium text-urgent hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mb-2 text-xs text-urgent">{error}</p>}

      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@ejemplo.com"
          className="focus-input py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!email.trim() || createShare.isPending}
          className="focus-btn-ghost shrink-0 border border-mist-200 px-3 py-2 text-xs"
        >
          + Invitar
        </button>
      </div>
    </div>
  );
}
