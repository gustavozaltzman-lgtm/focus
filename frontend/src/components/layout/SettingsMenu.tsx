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

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 pb-1 pt-2.5 first:pt-1">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-mist-400">{icon}</span>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-mist-400">{label}</p>
    </div>
  );
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
          className={`absolute z-30 w-80 rounded-xl2 border border-mist-200 bg-surface p-2 shadow-lifted ${
            panelPosition === 'up' ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
          }`}
        >
          <SectionHeader
            label="Apariencia"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <ThemeToggle />

          <SectionHeader
            label="Seguridad y notificaciones"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3.5 4.5 6.5v5c0 4.4 3.2 7.6 7.5 9 4.3-1.4 7.5-4.6 7.5-9v-5L12 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <p className="px-2 pb-1.5 text-[11px] leading-snug text-mist-400">
            Activá cada una desde el dispositivo donde las querés usar.
          </p>
          <EnableBiometricButton />
          <BiometricDevicesList />
          <EnablePushButton />

          <SectionHeader
            label="Inteligencia artificial"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <AnthropicKeyForm />
        </div>
      )}
    </div>
  );
}
