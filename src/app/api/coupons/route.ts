export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(3).max(20).transform((s) => s.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).default(0),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: { coupons: coupons.map((c) => ({ ...c, _id: c.id })) } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    const existing = await db.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });

    const coupon = await db.coupon.create({ data: { ...parsed.data, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined } });
    return NextResponse.json({ data: { coupon } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
