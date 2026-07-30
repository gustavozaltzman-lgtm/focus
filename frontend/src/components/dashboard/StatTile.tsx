interface StatTileProps {
  label: string;
  value: number;
  accentClassName: string;
}

export function StatTile({ label, value, accentClassName }: StatTileProps) {
  return (
    <div className="focus-card flex-1 px-5 py-4">
      <p className={`text-2xl font-semibold ${accentClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-mist-400">{label}</p>
    </div>
  );
}
