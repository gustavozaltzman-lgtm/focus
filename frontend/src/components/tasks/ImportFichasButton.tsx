import { useRef, useState } from 'react';
import { useImportFichas } from '../../hooks/useTasks';

export function ImportFichasButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const importFichas = useImportFichas();
  const [message, setMessage] = useState<string | null>(null);

  function handlePick() {
    setMessage(null);
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      importFichas.mutate(text, {
        onSuccess: (result) => {
          const taskWord = result.created === 1 ? 'tarea nueva' : 'tareas nuevas';
          setMessage(
            result.created > 0
              ? `${result.created} ${taskWord} en Inbox${result.skipped > 0 ? ` (${result.skipped} ya existían)` : ''}.`
              : `Nada nuevo — las ${result.skipped} fichas ya estaban importadas.`,
          );
        },
        onError: () => setMessage('No se pudo importar el archivo.'),
      });
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePick}
        disabled={importFichas.isPending}
        className="focus-btn-ghost px-3 py-1.5 text-xs"
      >
        {importFichas.isPending ? 'Importando…' : 'Importar fichas'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
      {message && <p className="text-xs text-mist-500">{message}</p>}
    </div>
  );
}
