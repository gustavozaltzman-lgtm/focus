import { useEffect, useState } from 'react';
import * as webauthnApi from '../../api/webauthn';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BiometricDevicesList() {
  const [devices, setDevices] = useState<webauthnApi.WebauthnDevice[] | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    webauthnApi
      .fetchDevices()
      .then(setDevices)
      .catch(() => setDevices([]));
  }, []);

  async function handleRevoke(id: string) {
    setRemovingId(id);
    try {
      await webauthnApi.revokeDevice(id);
      setDevices((current) => current?.filter((d) => d.id !== id) ?? null);
    } finally {
      setRemovingId(null);
    }
  }

  if (!devices || devices.length === 0) return null;

  return (
    <div className="px-2 py-1.5">
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
        Dispositivos con biometría
      </p>
      <ul className="flex flex-col gap-1">
        {devices.map((device) => (
          <li key={device.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate text-mist-500">
              {device.deviceName ?? device.deviceType} · desde {formatDate(device.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => handleRevoke(device.id)}
              disabled={removingId === device.id}
              className="shrink-0 rounded-md px-1.5 py-1 font-medium text-urgent transition hover:bg-mist-100 disabled:opacity-50"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
