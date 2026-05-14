export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { couponRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getRateLimitKey(req);
    const rl = couponRateLimit(ip);
    if (!rl.allowed) return NextResponse.json({ error: 'Too many coupon attempts. Please wait.' }, { status: 429 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { code, cartTotal } = body as { code?: string; cartTotal?: number };
    if (!code || typeof cartTotal !== 'number') return NextResponse.json({ error: 'code and cartTotal are required' }, { status: 400 });

    const coupon = await db.coupon.findFirst({ where: { code: code.toUpperCase().trim(), isActive: true } });
    if (!coupon) return NextResponse.json({ error: 'كود الخصم غير صالح أو منتهي الصلاحية' }, { status: 404 });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return NextResponse.json({ error: 'انتهت صلاحية هذا الكود' }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: 'تم استخدام هذا الكود بالحد الأقصى' }, { status: 400 });
    if (cartTotal < coupon.minOrderValue) return NextResponse.json({ error: `الحد الأدنى للطلب لاستخدام هذا الكود هو ${coupon.minOrderValue} جنيه` }, { status: 400 });

    const discountAmount = coupon.discountType === 'percentage'
      ? Math.round((cartTotal * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, cartTotal);

    return NextResponse.json({ data: { valid: true, code: coupon.code, type: coupon.discountType, value: coupon.discountValue, discountAmount, finalTotal: cartTotal - discountAmount, message: coupon.discountType === 'percentage' ? `خصم ${coupon.discountValue}% 🎉` : `خصم ${coupon.discountValue} جنيه 🎉` } });
  } catch (error) {
    console.error('[POST /api/coupons/validate]', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
