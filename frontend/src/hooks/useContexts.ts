import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as contextsApi from '../api/contexts';

export function useContexts() {
  return useQuery({
    queryKey: ['contexts'],
    queryFn: contextsApi.fetchContexts,
  });
}

export function useContext_(id: string | undefined) {
  return useQuery({
    queryKey: ['contexts', id],
    queryFn: () => contextsApi.fetchContext(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, colorHex }: { name: string; colorHex: string }) =>
      contextsApi.createContext(name, colorHex),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contexts'] }),
  });
}
