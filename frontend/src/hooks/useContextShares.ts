import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as sharesApi from '../api/contextShares';

export function useShares(contextId: string) {
  return useQuery({
    queryKey: ['context-shares', contextId],
    queryFn: () => sharesApi.fetchShares(contextId),
  });
}

export function useCreateShare(contextId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => sharesApi.createShare(contextId, email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['context-shares', contextId] }),
  });
}

export function useRevokeShare(contextId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) => sharesApi.revokeShare(contextId, shareId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['context-shares', contextId] }),
  });
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: sharesApi.fetchSharedWithMe,
  });
}

export function useSharedContextView(contextId: string | undefined) {
  return useQuery({
    queryKey: ['shared-view', contextId],
    queryFn: () => sharesApi.fetchSharedView(contextId as string),
    enabled: Boolean(contextId),
  });
}
