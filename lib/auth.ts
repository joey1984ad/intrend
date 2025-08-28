import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  provider: string;
}

export function createSessionToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function validateSessionToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

export function createSecureCookie(name: string, value: string, maxAge: number = 60 * 60 * 24 * 7) {
  return {
    name,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge,
      path: '/'
    }
  };
}
