import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as remindersApi from '../api/reminders';

export function useRemindersForTask(taskId: string | undefined) {
  return useQuery({
    queryKey: ['reminders', taskId],
    queryFn: () => remindersApi.fetchRemindersForTask(taskId as string),
    enabled: Boolean(taskId),
  });
}

export function useDueReminders() {
  return useQuery({
    queryKey: ['reminders', 'due'],
    queryFn: remindersApi.fetchDueReminders,
    refetchInterval: 20_000,
    refetchIntervalInBackground: true,
  });
}

export function useCreateReminder(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (triggerAt: string) => remindersApi.createReminder(taskId, triggerAt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders', taskId] }),
  });
}

export function useDeleteReminder(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.deleteReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders', taskId] }),
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.dismissReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders', 'due'] }),
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      remindersApi.snoozeReminder(id, minutes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders', 'due'] }),
  });
}
