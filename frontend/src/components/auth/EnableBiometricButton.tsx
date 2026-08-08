import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { useEffect, useState } from 'react';
import * as webauthnApi from '../../api/webauthn';
import { useBiometricDevices, useInvalidateBiometricDevices } from '../../hooks/useWebauthn';

type Status = 'idle' | 'working' | 'done' | 'error';

export function EnableBiometricButton({ className }: { className?: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const { data: devices } = useBiometricDevices();
  const invalidateDevices = useInvalidateBiometricDevices();
  const hasDevices = (devices?.length ?? 0) > 0;

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
      invalidateDevices();
    } catch {
      setStatus('error');
    }
  }

  const label = {
    idle: hasDevices ? 'Agregar otro dispositivo' : 'Activar Face ID / huella en este dispositivo',
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
        'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100 disabled:opacity-60'
      }
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="shrink-0 text-mist-400">
        <path
          d="M12 4a5 5 0 0 0-5 5v1.5M12 4a5 5 0 0 1 5 5v1.5M4.5 10.5V12a7.5 7.5 0 0 0 3.5 6.35M19.5 10.5V12c0 1.7-.47 3.3-1.28 4.66M8.5 10.2V12a3.5 3.5 0 0 0 5.9 2.55M15.5 10.2V13a3.48 3.48 0 0 1-.52 1.84"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
