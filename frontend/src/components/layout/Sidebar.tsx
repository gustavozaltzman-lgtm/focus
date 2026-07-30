import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContexts } from '../../hooks/useContexts';

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-mist-500 hover:bg-mist-100 hover:text-ink-950';
const linkActive = 'bg-ink-950 text-white hover:bg-ink-950 hover:text-white';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { data: contexts = [] } = useContexts();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between border-r border-mist-200 bg-mist-50 px-4 py-6">
      <div>
        <div className="mb-8 px-2">
          <p className="text-lg font-semibold tracking-tight text-ink-950">Focus</p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Hoy
          </NavLink>
          <NavLink to="/inbox" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Inbox
          </NavLink>
        </nav>

        <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-mist-400">
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
                <span className="ml-auto text-xs text-mist-400">{context.active_task_count}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-950">{user?.full_name}</p>
          <p className="truncate text-xs text-mist-400">{user?.email}</p>
        </div>
        <button onClick={logout} className="focus-btn-ghost px-2 py-1 text-xs">
          Salir
        </button>
      </div>
    </aside>
  );
}
