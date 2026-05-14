export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { SHIPPING_RATES } from '@/lib/shipping';

export async function GET() {
  return NextResponse.json({
    data: {
      rates: SHIPPING_RATES,
      default: 75,
      currency: 'EGP',
    },
  });
}
