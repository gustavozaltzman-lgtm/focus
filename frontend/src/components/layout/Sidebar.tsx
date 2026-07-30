import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContexts } from '../../hooks/useContexts';
import { useSharedWithMe } from '../../hooks/useContextShares';
import { useUpdateTask } from '../../hooks/useTasks';
import { EnableBiometricButton } from '../auth/EnableBiometricButton';
import { EnablePushButton } from '../reminders/EnablePushButton';
import { DropNavLink } from './DropNavLink';

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-mist-400/80 hover:bg-white/5 hover:text-white';
const linkActive = 'bg-white/10 text-white shadow-[inset_3px_0_0_0_#D9A441]';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { data: contexts = [] } = useContexts();
  const { data: sharedContexts = [] } = useSharedWithMe();
  const updateTask = useUpdateTask();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between bg-ink-950 px-4 py-6 md:flex">
      <div>
        <div className="mb-8 px-2">
          <p className="text-xl font-bold tracking-tight text-white">Focus</p>
          <p className="figures mt-0.5 text-[11px] uppercase tracking-widest text-signal-light">
            Execution engine
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <DropNavLink
            to="/"
            end
            className={linkBase}
            activeClassName={linkActive}
            onDropTask={(taskId) =>
              updateTask.mutate({ id: taskId, payload: { status: 'today' } })
            }
          >
            Hoy
          </DropNavLink>
          <DropNavLink
            to="/inbox"
            className={linkBase}
            activeClassName={linkActive}
            onDropTask={(taskId) =>
              updateTask.mutate({ id: taskId, payload: { status: 'inbox' } })
            }
          >
            Inbox
          </DropNavLink>
          <DropNavLink
            to="/planning"
            className={linkBase}
            activeClassName={linkActive}
            onDropTask={(taskId) =>
              updateTask.mutate({ id: taskId, payload: { status: 'upcoming' } })
            }
          >
            Próximamente
          </DropNavLink>
        </nav>

        <div className="mb-2 mt-6 flex items-center justify-between px-3">
          <Link
            to="/contexts"
            className="text-[11px] font-semibold uppercase tracking-widest text-mist-400/50 hover:text-white"
          >
            Contextos
          </Link>
          <Link
            to="/contexts"
            aria-label="Gestionar contextos"
            className="rounded p-0.5 text-mist-400/50 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {contexts.map((context) => (
            <DropNavLink
              key={context.id}
              to={`/contexts/${context.id}`}
              className={linkBase}
              activeClassName={linkActive}
              onDropTask={(taskId) =>
                updateTask.mutate({ id: taskId, payload: { contextId: context.id } })
              }
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
            </DropNavLink>
          ))}
        </nav>

        {sharedContexts.length > 0 && (
          <>
            <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-mist-400/50">
              Compartido conmigo
            </p>
            <nav className="flex flex-col gap-1">
              {sharedContexts.map((shared) => (
                <NavLink
                  key={shared.id}
                  to={`/shared/${shared.id}`}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: shared.color_hex }}
                  />
                  <span className="truncate">{shared.name}</span>
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </div>

      <div className="space-y-3 px-2">
        <EnableBiometricButton />
        <EnablePushButton />
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
