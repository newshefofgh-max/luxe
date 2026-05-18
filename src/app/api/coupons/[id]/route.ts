export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';

type RouteContext = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(req);
    const { id } = params;
    const body = await req.json();

    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    return NextResponse.json({ success: true, data: { ...coupon, _id: coupon.id } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[PATCH /api/coupons/[id]]', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(req);
    const { id } = params;

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[DELETE /api/coupons/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
