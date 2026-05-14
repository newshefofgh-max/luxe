export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword, AuthError, createAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, phone, password } = parsed.data;

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({ data: { name, email, phone, password: hashedPassword, role: 'user' } });

    const token = signToken({ userId: user.id, email: user.email, role: 'customer' });
    const userResponse = { _id: user.id, id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt };

    const response = NextResponse.json({ data: { user: userResponse, token } }, { status: 201 });
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
