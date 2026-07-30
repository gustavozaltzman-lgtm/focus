import { NavLink } from 'react-router-dom';

const tabBase = 'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-mist-400';
const tabActive = 'text-ink-950';

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-mist-200 bg-paper/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <NavLink to="/" end className={({ isActive }) => `${tabBase} ${isActive ? tabActive : ''}`}>
        <HomeIcon />
        Hoy
      </NavLink>
      <NavLink to="/inbox" className={({ isActive }) => `${tabBase} ${isActive ? tabActive : ''}`}>
        <InboxIcon />
        Inbox
      </NavLink>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5 12 5l8 6.5M6 10v8h5v-5h2v5h5v-8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12h4l2 3h4l2-3h4M5 12 6.5 5.5A1 1 0 0 1 7.5 5h9a1 1 0 0 1 1 .5L19 12v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
