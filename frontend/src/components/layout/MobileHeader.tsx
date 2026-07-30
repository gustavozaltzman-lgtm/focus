import { useAuth } from '../../context/AuthContext';
import { EnableBiometricButton } from '../auth/EnableBiometricButton';
import { EnablePushButton } from '../reminders/EnablePushButton';

export function MobileHeader() {
  const { logout } = useAuth();

  return (
    <div className="mb-6 md:hidden">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold tracking-tight text-ink-950">Focus</p>
        <button onClick={logout} className="focus-btn-ghost px-2 py-1 text-xs">
          Salir
        </button>
      </div>
      <EnableBiometricButton className="mt-1 text-xs font-medium text-mist-400 underline-offset-2 hover:text-ink-950 hover:underline" />
      <EnablePushButton className="mt-1 text-xs font-medium text-mist-400 underline-offset-2 hover:text-ink-950 hover:underline" />
    </div>
  );
}
