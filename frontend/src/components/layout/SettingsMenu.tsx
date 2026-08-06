import { useEffect, useRef, useState } from 'react';
import { EnableBiometricButton } from '../auth/EnableBiometricButton';
import { EnablePushButton } from '../reminders/EnablePushButton';
import { AnthropicKeyForm } from './AnthropicKeyForm';

interface SettingsMenuProps {
  panelPosition?: 'up' | 'down';
  triggerClassName?: string;
  compact?: boolean;
}

export function SettingsMenu({ panelPosition = 'up', triggerClassName, compact }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Configuración"
        aria-expanded={open}
        className={
          triggerClassName ??
          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-mist-500 transition hover:bg-mist-100 hover:text-ink-950'
        }
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2.5M12 18.5V21M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3 12h2.5M18.5 12H21M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {!compact && 'Configuración'}
      </button>

      {open && (
        <div
          className={`absolute z-30 w-72 rounded-xl2 border border-mist-200 bg-white p-2 shadow-lifted ${
            panelPosition === 'up' ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
          }`}
        >
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
            Dispositivo
          </p>
          <EnableBiometricButton className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100" />
          <EnablePushButton className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100" />
          <div className="my-1.5 border-t border-mist-100" />
          <AnthropicKeyForm />
        </div>
      )}
    </div>
  );
}
