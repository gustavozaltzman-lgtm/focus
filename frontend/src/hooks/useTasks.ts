import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: tasksApi.fetchDashboard,
  });
}

export function useTasks(query: tasksApi.TaskQuery = {}) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => tasksApi.fetchTasks(query),
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['contexts'] });
  };
}

export function useQuickCapture() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: tasksApi.quickCapture,
    onSuccess: invalidate,
  });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: invalidate,
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<tasksApi.CreateTaskPayload> }) =>
      tasksApi.updateTask(id, payload),
    onSuccess: invalidate,
  });
}

export function useCompleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: tasksApi.completeTask,
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: invalidate,
  });
}
