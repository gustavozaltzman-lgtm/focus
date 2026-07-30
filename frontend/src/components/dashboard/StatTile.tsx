import { AnimatedNumber } from '../ui/AnimatedNumber';

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
      className={`w-full min-w-0 overflow-hidden rounded-xl2 border border-mist-200 bg-white px-2 py-2 text-left shadow-soft transition-all duration-200 sm:px-3 sm:py-2.5 ${
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-mist-300 hover:shadow-lifted active:translate-y-0 active:scale-[0.97]'
          : ''
      }`}
    >
      <p className={`figures text-base leading-none sm:text-lg font-medium ${accentClassName}`}>
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 break-words text-[9px] uppercase leading-tight tracking-normal text-mist-400 sm:text-[10px]">
        {label}
      </p>
    </button>
  );
}
