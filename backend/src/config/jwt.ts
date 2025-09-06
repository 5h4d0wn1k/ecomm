import jwt, { Secret } from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  role: string;
  email: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return (jwt.sign as any)(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (payload: { userId: number }): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return (jwt.sign as any)(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): { userId: number } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: number };
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};