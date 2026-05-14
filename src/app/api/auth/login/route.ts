export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, comparePassword, AuthError, createAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { authRateLimit, getClientIP } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = authRateLimit(ip);
    if (!rl.allowed) return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    if (!user.isActive) return NextResponse.json({ error: 'Your account has been deactivated.' }, { status: 403 });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const token = signToken({ userId: user.id, email: user.email, role: user.role === 'admin' ? 'admin' : 'customer' });
    const userResponse = { _id: user.id, id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt };

    const response = NextResponse.json({ data: { user: userResponse, token } }, { status: 200 });
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
