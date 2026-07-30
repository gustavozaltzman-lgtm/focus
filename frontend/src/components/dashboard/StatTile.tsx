interface StatTileProps {
  label: string;
  value: number;
  accentClassName: string;
}

export function StatTile({ label, value, accentClassName }: StatTileProps) {
  return (
    <div className="focus-card flex-1 px-5 py-4">
      <p className={`figures text-[26px] font-medium leading-none ${accentClassName}`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-mist-400">{label}</p>
    </div>
  );
}
