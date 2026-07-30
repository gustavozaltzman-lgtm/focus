import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContexts } from '../../hooks/useContexts';
import { EnableBiometricButton } from '../auth/EnableBiometricButton';

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-mist-400/80 hover:bg-white/5 hover:text-white';
const linkActive = 'bg-white/10 text-white';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { data: contexts = [] } = useContexts();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between bg-ink-950 px-4 py-6 md:flex">
      <div>
        <div className="mb-8 px-2">
          <p className="font-display text-xl text-white">Focus</p>
          <p className="figures mt-0.5 text-[11px] uppercase tracking-widest text-mist-400/60">
            Execution engine
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Hoy
          </NavLink>
          <NavLink to="/inbox" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Inbox
          </NavLink>
        </nav>

        <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-mist-400/50">
          Contextos
        </p>
        <nav className="flex flex-col gap-1">
          {contexts.map((context) => (
            <NavLink
              key={context.id}
              to={`/contexts/${context.id}`}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: context.color_hex }}
              />
              <span className="truncate">{context.name}</span>
              {context.active_task_count ? (
                <span className="figures ml-auto text-xs text-mist-400/60">
                  {context.active_task_count}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3 px-2">
        <EnableBiometricButton />
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.full_name}</p>
            <p className="truncate text-xs text-mist-400/60">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg px-2 py-1 text-xs font-medium text-mist-400/70 transition hover:bg-white/5 hover:text-white"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
