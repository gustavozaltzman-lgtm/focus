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
        'w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-mist-400/70 transition hover:bg-white/5 hover:text-white disabled:opacity-60'
      }
    >
      {label}
    </button>
  );
}
