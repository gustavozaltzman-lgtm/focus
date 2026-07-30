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
      className="focus-card min-w-0 flex-1 overflow-hidden px-2 py-2 text-left transition enabled:cursor-pointer enabled:hover:border-mist-300 sm:px-3 sm:py-2.5"
    >
      <p className={`figures text-base leading-none sm:text-lg font-medium ${accentClassName}`}>
        {value}
      </p>
      <p className="mt-1 break-words text-[9px] uppercase leading-tight tracking-normal text-mist-400 sm:text-[10px]">
        {label}
      </p>
    </button>
  );
}
