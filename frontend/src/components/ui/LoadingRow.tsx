import { Spinner } from './Spinner';

export function LoadingRow({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-mist-400">
      <Spinner />
      {label}
    </div>
  );
}
