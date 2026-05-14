import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Please define the JWT_SECRET environment variable');
  return secret;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  iat?: number;
  exp?: number;
}

// Keep legacy alias for backward compat
export type JWTPayload = JwtPayload;

type ApiHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

// ─── Token Utilities ──────────────────────────────────────────────────────────

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401);
    }
    throw new AuthError('Token verification failed', 401);
  }
}

export function getTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1] || null;
}

export function getTokenFromCookie(req: NextRequest): string | null {
  return req.cookies.get('auth_token')?.value ?? req.cookies.get('token')?.value ?? null;
}

export function extractToken(req: NextRequest): string | null {
  return getTokenFromHeader(req) || getTokenFromCookie(req);
}

export function getAuthUser(req: NextRequest): JwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JwtPayload {
  const user = getAuthUser(req);
  if (!user) throw new AuthError('Unauthorized: no valid token', 401);
  return user;
}

export function requireAdmin(req: NextRequest): JwtPayload {
  const user = requireAuth(req);
  if (user.role !== 'admin') throw new AuthError('Forbidden: admin access required', 403);
  return user;
}

// ─── Password Utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Middleware HOC ───────────────────────────────────────────────────────────

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      const payload = verifyToken(token);
      const requestWithUser = new NextRequest(req, {
        headers: {
          ...Object.fromEntries(req.headers.entries()),
          'x-user-id': payload.userId,
          'x-user-email': payload.email,
          'x-user-role': payload.role,
        },
      });
      return handler(requestWithUser, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      const status = error instanceof AuthError ? error.status : 401;
      return NextResponse.json({ success: false, error: message }, { status });
    }
  };
}

export function withAdminAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      const payload = verifyToken(token);
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
      const requestWithUser = new NextRequest(req, {
        headers: {
          ...Object.fromEntries(req.headers.entries()),
          'x-user-id': payload.userId,
          'x-user-email': payload.email,
          'x-user-role': payload.role,
        },
      });
      return handler(requestWithUser, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      const status = error instanceof AuthError ? error.status : 401;
      return NextResponse.json({ success: false, error: message }, { status });
    }
  };
}

// ─── Helper to read user from augmented request ───────────────────────────────

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const userId = req.headers.get('x-user-id');
  const email = req.headers.get('x-user-email');
  const role = req.headers.get('x-user-role') as 'customer' | 'admin' | null;
  if (!userId || !email || !role) return null;
  return { userId, email, role };
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

export function createAuthCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60;
  return [
    `auth_token=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearAuthCookie(): string {
  return 'auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
}

// ─── Error Class ──────────────────────────────────────────────────────────────

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
