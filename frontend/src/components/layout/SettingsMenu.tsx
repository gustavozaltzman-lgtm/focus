import { useEffect, useRef, useState } from 'react';
import { EnableBiometricButton } from '../auth/EnableBiometricButton';
import { EnablePushButton } from '../reminders/EnablePushButton';
import { AnthropicKeyForm } from './AnthropicKeyForm';
import { BiometricDevicesList } from './BiometricDevicesList';
import { ThemeToggle } from './ThemeToggle';

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
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {!compact && 'Configuración'}
      </button>

      {open && (
        <div
          className={`absolute z-30 w-72 rounded-xl2 border border-mist-200 bg-surface p-2 shadow-lifted ${
            panelPosition === 'up' ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
          }`}
        >
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
            Apariencia
          </p>
          <ThemeToggle />
          <div className="my-1.5 border-t border-mist-100" />
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-mist-400">
            Dispositivo
          </p>
          <EnableBiometricButton className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100" />
          <EnablePushButton className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-950 transition hover:bg-mist-100" />
          <BiometricDevicesList />
          <div className="my-1.5 border-t border-mist-100" />
          <AnthropicKeyForm />
        </div>
      )}
    </div>
  );
}
