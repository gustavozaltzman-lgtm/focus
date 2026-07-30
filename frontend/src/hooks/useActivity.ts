import { useQuery } from '@tanstack/react-query';
import * as activityApi from '../api/activity';

export function useTaskActivity(taskId: string | undefined) {
  return useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => activityApi.fetchTaskActivity(taskId as string),
    enabled: Boolean(taskId),
  });
}
