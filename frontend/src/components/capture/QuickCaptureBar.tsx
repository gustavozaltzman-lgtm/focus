import { FormEvent, useState } from 'react';
import { usePreviewCapture } from '../../hooks/useTasks';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { MicButton } from './MicButton';
import { TaskDraft, TaskFormModal } from '../tasks/TaskFormModal';

export function QuickCaptureBar() {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const previewCapture = usePreviewCapture();

  const { isSupported: isVoiceSupported, isListening, start, stop } = useSpeechRecognition({
    onFinalResult: (transcript) => setText(transcript),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    previewCapture.mutate(trimmed, {
      onSuccess: (preview) => {
        setDraft(preview);
        setText('');
      },
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="focus-card flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <span className="hidden shrink-0 text-mist-400 sm:inline-flex">
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
          placeholder={
            isListening ? 'Escuchando…' : 'Ej. "Reporte a CDI el viernes, alta"'
          }
          className="min-w-0 flex-1 truncate border-none bg-transparent text-[15px] text-ink-950 placeholder:text-mist-400 outline-none"
        />
        {isVoiceSupported && (
          <MicButton isListening={isListening} onClick={isListening ? stop : start} />
        )}
        <button
          type="submit"
          disabled={!text.trim() || previewCapture.isPending}
          className="focus-btn-primary shrink-0 px-3.5 sm:px-4"
        >
          {previewCapture.isPending ? '…' : 'Agregar'}
        </button>
      </form>

      {draft && (
        <TaskFormModal
          initialValues={draft}
          title_="Confirmá lo que entendí"
          onClose={() => setDraft(null)}
        />
      )}
    </>
  );
}
