import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useDraftFollowUp } from '../../hooks/useTasks';

export function FollowUpDraftButton({ taskId }: { taskId: string }) {
  const draftFollowUp = useDraftFollowUp();
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    draftFollowUp.mutate(taskId, {
      onSuccess: (text) => setDraft(text),
      onError: (err) => {
        const message = isAxiosError(err) ? err.response?.data?.error : undefined;
        setError(message ?? 'No se pudo generar el borrador.');
      },
    });
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-mist-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-950">Seguimiento con IA</p>
        <button
          type="button"
          onClick={handleClick}
          disabled={draftFollowUp.isPending}
          className="focus-btn-ghost shrink-0 px-3 py-1.5 text-xs"
        >
          {draftFollowUp.isPending ? 'Redactando…' : draft ? 'Regenerar' : 'Redactar borrador'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-urgent">{error}</p>}
      {draft && (
        <div className="mt-2">
          <textarea
            readOnly
            value={draft}
            rows={5}
            className="focus-input resize-none text-sm"
            onFocus={(e) => e.target.select()}
          />
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1.5 text-xs font-medium text-signal hover:underline"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  );
}
