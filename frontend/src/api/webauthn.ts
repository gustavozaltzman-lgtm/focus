import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { User } from '../types/domain';
import { apiClient } from './client';

export async function fetchRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const { data } = await apiClient.get<PublicKeyCredentialCreationOptionsJSON>(
    '/webauthn/register/options',
  );
  return data;
}

export async function verifyRegistration(
  response: RegistrationResponseJSON,
  deviceName: string | null,
): Promise<void> {
  await apiClient.post('/webauthn/register/verify', { response, deviceName });
}

export interface WebauthnDevice {
  id: string;
  deviceName: string | null;
  deviceType: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function fetchDevices(): Promise<WebauthnDevice[]> {
  const { data } = await apiClient.get<{ devices: WebauthnDevice[] }>('/webauthn/devices');
  return data.devices;
}

export async function fetchAuthenticationOptions(
  email: string,
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const { data } = await apiClient.post<PublicKeyCredentialRequestOptionsJSON>(
    '/webauthn/login/options',
    { email },
  );
  return data;
}

export async function verifyAuthentication(
  email: string,
  response: AuthenticationResponseJSON,
): Promise<{ user: User; token: string }> {
  const { data } = await apiClient.post<{ user: User; token: string }>('/webauthn/login/verify', {
    email,
    response,
  });
  return data;
}
