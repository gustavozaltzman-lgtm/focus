interface StatTileProps {
  label: string;
  value: number;
  accentClassName: string;
}

export function StatTile({ label, value, accentClassName }: StatTileProps) {
  return (
    <div className="focus-card min-w-0 flex-1 overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
      <p className={`figures text-xl leading-none sm:text-[26px] font-medium ${accentClassName}`}>
        {value}
      </p>
      <p className="mt-2 break-words text-[10px] uppercase leading-tight tracking-wide text-mist-400 sm:text-xs sm:tracking-wide">
        {label}
      </p>
    </div>
  );
}
