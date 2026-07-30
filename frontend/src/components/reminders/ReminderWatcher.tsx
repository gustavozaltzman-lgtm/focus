import { useEffect, useRef } from 'react';
import { useDismissReminder, useDueReminders } from '../../hooks/useReminders';

function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => undefined);
  }
}

function showNotification(title: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  new Notification('Focus — recordatorio', { body: title, tag: 'focus-reminder' });
}

export function ReminderWatcher() {
  const { data: dueReminders = [] } = useDueReminders();
  const dismissReminder = useDismissReminder();
  const shownIds = useRef(new Set<string>());

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    for (const reminder of dueReminders) {
      if (shownIds.current.has(reminder.id)) continue;
      shownIds.current.add(reminder.id);
      showNotification(reminder.task_title);
      dismissReminder.mutate(reminder.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueReminders]);

  return null;
}
