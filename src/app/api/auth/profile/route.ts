export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, AuthError } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, phone } = parsed.data;

    if (phone) {
      const existing = await db.user.findFirst({ where: { phone, NOT: { id: authUser.userId } } });
      if (existing) return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 });
    }

    const updated = await db.user.update({
      where: { id: authUser.userId },
      data: { ...(name && { name }), ...(phone && { phone }) },
      omit: { password: true },
    });

    return NextResponse.json({
      data: { user: { ...updated, _id: updated.id, addresses: JSON.parse(updated.addresses) } },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[PUT /api/auth/profile]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
