import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { createUser, findUserByEmail } from '../repositories/user.repository';
import { PublicUser, User } from '../types/domain';

const SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function toPublicUser(user: User): PublicUser {
  const { password_hash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ user: PublicUser; token: string }> {
  const existing = await findUserByEmail(params.email.toLowerCase());
  if (existing) {
    throw new AuthError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const user = await createUser({
    email: params.email.toLowerCase(),
    passwordHash,
    fullName: params.fullName,
  });

  return { user: toPublicUser(user), token: generateToken(user) };
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser; token: string }> {
  const user = await findUserByEmail(params.email.toLowerCase());
  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(params.password, user.password_hash);
  if (!isValid) {
    throw new AuthError('Invalid email or password');
  }

  return { user: toPublicUser(user), token: generateToken(user) };
}

export { toPublicUser };
