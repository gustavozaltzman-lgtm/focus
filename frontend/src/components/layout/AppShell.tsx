import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { MobileHeader } from './MobileHeader';
import { ReminderWatcher } from '../reminders/ReminderWatcher';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      <ReminderWatcher />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-6 pb-24 sm:px-8 sm:py-12 md:pb-12">
          <MobileHeader />
          {children}
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
