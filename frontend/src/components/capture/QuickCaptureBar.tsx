import { FormEvent, useState } from 'react';
import { useQuickCapture } from '../../hooks/useTasks';

export function QuickCaptureBar() {
  const [text, setText] = useState('');
  const quickCapture = useQuickCapture();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    quickCapture.mutate(trimmed, {
      onSuccess: () => setText(''),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="focus-card flex items-center gap-3 px-4 py-3">
      <span className="text-mist-400">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16m8-8H4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Ej. "Enviar reporte a CDI el viernes prioridad alta"'
        className="flex-1 border-none bg-transparent text-[15px] text-ink-950 placeholder:text-mist-400 outline-none"
      />
      <button
        type="submit"
        disabled={!text.trim() || quickCapture.isPending}
        className="focus-btn-primary"
      >
        {quickCapture.isPending ? 'Agregando…' : 'Agregar'}
      </button>
    </form>
  );
}
