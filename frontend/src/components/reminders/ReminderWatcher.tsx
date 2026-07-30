import { useEffect, useRef } from 'react';
import { useDismissReminder, useDueReminders } from '../../hooks/useReminders';

function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return;
  try {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  } catch {
    // Algunos navegadores mobile (ej. Chrome Android) no permiten pedir
    // permiso ni construir Notification fuera de un Service Worker.
  }
}

function showNotification(title: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification('Focus — recordatorio', { body: title, tag: 'focus-reminder' });
  } catch {
    // Chrome Android exige ServiceWorkerRegistration.showNotification() en
    // vez del constructor directo; sin service worker, no hay alarma visual
    // ahí, pero no debe romper el resto de la app.
  }
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
