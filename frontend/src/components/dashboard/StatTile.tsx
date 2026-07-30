interface StatTileProps {
  label: string;
  value: number;
  accentClassName: string;
  onClick?: () => void;
}

export function StatTile({ label, value, accentClassName, onClick }: StatTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="focus-card min-w-0 flex-1 overflow-hidden px-3 py-3 text-left transition enabled:cursor-pointer enabled:hover:border-mist-300 sm:px-5 sm:py-4"
    >
      <p className={`figures text-xl leading-none sm:text-[26px] font-medium ${accentClassName}`}>
        {value}
      </p>
      <p className="mt-2 break-words text-[10px] uppercase leading-tight tracking-wide text-mist-400 sm:text-xs sm:tracking-wide">
        {label}
      </p>
    </button>
  );
}
