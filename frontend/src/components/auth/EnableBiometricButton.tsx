import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { useEffect, useState } from 'react';
import * as webauthnApi from '../../api/webauthn';

type Status = 'idle' | 'working' | 'done' | 'error';

export function EnableBiometricButton({ className }: { className?: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
  }, []);

  if (!isSupported) return null;

  async function handleClick() {
    setStatus('working');
    try {
      const options = await webauthnApi.fetchRegistrationOptions();
      const response = await startRegistration(options);
      const deviceName =
        typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : null;
      await webauthnApi.verifyRegistration(response, deviceName);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const label = {
    idle: 'Activar Face ID / huella en este dispositivo',
    working: 'Activando…',
    done: 'Dispositivo activado ✓',
    error: 'No se pudo activar, reintentar',
  }[status];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'working' || status === 'done'}
      className={
        className ??
        'w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-mist-500 transition hover:bg-mist-100 hover:text-ink-950 disabled:opacity-60'
      }
    >
      {label}
    </button>
  );
}
