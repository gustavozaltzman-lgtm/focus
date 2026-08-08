import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as webauthnApi from '../api/webauthn';

const DEVICES_KEY = ['webauthn-devices'];

export function useBiometricDevices() {
  return useQuery({ queryKey: DEVICES_KEY, queryFn: webauthnApi.fetchDevices });
}

export function useRevokeDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: webauthnApi.revokeDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
  });
}

export function useInvalidateBiometricDevices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
}
