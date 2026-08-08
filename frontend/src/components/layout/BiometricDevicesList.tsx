import { useBiometricDevices, useRevokeDevice } from '../../hooks/useWebauthn';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BiometricDevicesList() {
  const { data: devices } = useBiometricDevices();
  const revokeDevice = useRevokeDevice();

  if (!devices || devices.length === 0) return null;

  return (
    <div className="pl-[1.9rem] pr-2 pt-1">
      <ul className="flex flex-col gap-1 border-l border-mist-100 pl-3">
        {devices.map((device) => (
          <li key={device.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate text-mist-500">
              {device.deviceName ?? device.deviceType} · desde {formatDate(device.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => revokeDevice.mutate(device.id)}
              disabled={revokeDevice.isPending && revokeDevice.variables === device.id}
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
