import { useEffect, useState } from 'react';
import { enablePushNotifications, isPushSupported } from '../../lib/push';

type Status = 'idle' | 'working' | 'done' | 'error';

export function EnablePushButton({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
  }, []);

  if (!supported) return null;

  async function handleClick() {
    setStatus('working');
    setErrorMessage(null);
    try {
      await enablePushNotifications();
      setStatus('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo activar.');
      setStatus('error');
    }
  }

  const label = {
    idle: 'Activar alarmas aunque la app esté cerrada',
    working: 'Activando…',
    done: 'Alarmas por push activadas ✓',
    error: errorMessage ?? 'No se pudo activar, reintentar',
  }[status];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'working' || status === 'done'}
      className={
        className ??
        'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100 disabled:opacity-60'
      }
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="shrink-0 text-mist-400">
        <path
          d="M18 8a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14 18 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 19.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
