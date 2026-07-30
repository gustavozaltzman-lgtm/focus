import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { env } from '../config/env';
import { findUserByEmail, findUserById } from '../repositories/user.repository';
import * as credentialRepo from '../repositories/webauthn.repository';
import { AuthError, generateToken, toPublicUser } from './auth.service';
import { PublicUser, User } from '../types/domain';

const registrationChallenges = new Map<string, string>();
const authenticationChallenges = new Map<string, string>();

function toAuthenticatorDevice(credential: credentialRepo.WebauthnCredential): AuthenticatorDevice {
  return {
    credentialID: credential.credential_id,
    credentialPublicKey: new Uint8Array(Buffer.from(credential.public_key, 'base64')),
    counter: Number(credential.counter),
    transports: (credential.transports ?? undefined) as AuthenticatorDevice['transports'],
  };
}

export async function createRegistrationOptions(user: User) {
  const existingCredentials = await credentialRepo.listCredentialsForUser(user.id);

  const options = await generateRegistrationOptions({
    rpName: env.webauthnRpName,
    rpID: env.webauthnRpId,
    userID: new Uint8Array(Buffer.from(user.id)),
    userName: user.email,
    userDisplayName: user.full_name,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    excludeCredentials: existingCredentials.map((credential) => ({
      id: credential.credential_id,
    })),
  });

  registrationChallenges.set(user.id, options.challenge);
  return options;
}

export async function verifyRegistration(
  user: User,
  response: RegistrationResponseJSON,
  deviceName: string | null,
): Promise<void> {
  const expectedChallenge = registrationChallenges.get(user.id);
  if (!expectedChallenge) {
    throw new AuthError('No hay un registro biométrico en curso para este usuario', 400);
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
  });

  registrationChallenges.delete(user.id);

  if (!verification.verified || !verification.registrationInfo) {
    throw new AuthError('No se pudo verificar el dispositivo', 400);
  }

  const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  await credentialRepo.createCredential({
    userId: user.id,
    credentialId: credentialID,
    publicKey: Buffer.from(credentialPublicKey).toString('base64'),
    counter,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    transports: response.response.transports ?? null,
    deviceName,
  });
}

export async function createAuthenticationOptions(email: string) {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    throw new AuthError('No hay credenciales biométricas registradas para este email', 404);
  }

  const credentials = await credentialRepo.listCredentialsForUser(user.id);
  if (credentials.length === 0) {
    throw new AuthError('No hay credenciales biométricas registradas para este email', 404);
  }

  const options = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    userVerification: 'preferred',
    allowCredentials: credentials.map((credential) => ({ id: credential.credential_id })),
  });

  authenticationChallenges.set(email.toLowerCase(), options.challenge);
  return options;
}

export async function verifyAuthentication(
  email: string,
  response: AuthenticationResponseJSON,
): Promise<{ user: PublicUser; token: string }> {
  const normalizedEmail = email.toLowerCase();
  const expectedChallenge = authenticationChallenges.get(normalizedEmail);
  if (!expectedChallenge) {
    throw new AuthError('No hay una verificación biométrica en curso para este email', 400);
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AuthError('No hay credenciales biométricas registradas para este email', 404);
  }

  const credential = await credentialRepo.findCredentialById(response.id);
  if (!credential || credential.user_id !== user.id) {
    throw new AuthError('Credencial biométrica desconocida', 400);
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
    authenticator: toAuthenticatorDevice(credential),
  });

  authenticationChallenges.delete(normalizedEmail);

  if (!verification.verified) {
    throw new AuthError('No se pudo verificar la identidad biométrica', 400);
  }

  await credentialRepo.updateCredentialCounter(
    credential.credential_id,
    verification.authenticationInfo.newCounter,
  );

  const freshUser = await findUserById(user.id);
  if (!freshUser) throw new AuthError('Usuario no encontrado', 404);

  return { user: toPublicUser(freshUser), token: generateToken(freshUser) };
}

export async function listDevices(userId: string) {
  const credentials = await credentialRepo.listCredentialsForUser(userId);
  return credentials.map((credential) => ({
    id: credential.id,
    deviceName: credential.device_name,
    deviceType: credential.device_type,
    createdAt: credential.created_at,
    lastUsedAt: credential.last_used_at,
  }));
}
