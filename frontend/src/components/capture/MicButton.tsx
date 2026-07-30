interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
}

export function MicButton({ isListening, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isListening ? 'Detener dictado' : 'Dictar por voz'}
      aria-pressed={isListening}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
        isListening
          ? 'bg-urgent/10 text-urgent'
          : 'text-mist-400 hover:bg-mist-100 hover:text-ink-950'
      }`}
    >
      {isListening && (
        <span className="absolute h-9 w-9 animate-ping rounded-full bg-urgent/20" />
      )}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative">
        <path
          d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M19 11a7 7 0 0 1-14 0M12 18v3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
