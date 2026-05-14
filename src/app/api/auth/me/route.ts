export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const user = await db.user.findUnique({ where: { id: authUser.userId }, omit: { password: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!user.isActive) return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 403 });
    return NextResponse.json({ data: { user: { ...user, _id: user.id, addresses: JSON.parse(user.addresses) } } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/auth/me]', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
