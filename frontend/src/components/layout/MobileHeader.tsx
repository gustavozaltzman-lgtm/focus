import { useAuth } from '../../context/AuthContext';
import { SettingsMenu } from './SettingsMenu';

export function MobileHeader() {
  const { logout } = useAuth();

  return (
    <div className="mb-6 flex items-center justify-between md:hidden">
      <p className="text-lg font-bold tracking-tight text-ink-950">Focus</p>
      <div className="flex items-center gap-1">
        <SettingsMenu
          panelPosition="down"
          compact
          triggerClassName="rounded-lg p-1.5 text-mist-500 transition hover:bg-mist-100 hover:text-ink-950"
        />
        <button onClick={logout} className="focus-btn-ghost px-2 py-1 text-xs">
          Salir
        </button>
      </div>
    </div>
  );
}
