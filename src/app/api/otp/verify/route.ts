export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { egyptianPhoneRegex } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { phone, otp } = body as { phone?: string; otp?: string };

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    if (!egyptianPhoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid Egyptian phone number format' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(phone, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { verified: true } });
  } catch (error) {
    console.error('[POST /api/otp/verify]', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
