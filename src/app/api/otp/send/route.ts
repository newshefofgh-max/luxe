export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOtpSchema } from '@/lib/validators';
import { otpRateLimit, getClientIP } from '@/lib/rateLimit';
import { sendOTPViaWhatsApp } from '@/lib/whatsapp';

/** Generate a cryptographically secure 6-digit OTP */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Fallback: send OTP via SMS gateway */
async function sendOTPViaSMS(phone: string, otp: string): Promise<boolean> {
  const SMS_API_URL = process.env.SMS_API_URL;
  const SMS_API_KEY = process.env.SMS_API_KEY;

  if (!SMS_API_URL || !SMS_API_KEY) {
    console.warn('[OTP] SMS gateway not configured');
    return false;
  }

  try {
    const normalizedPhone = phone.startsWith('0') ? `2${phone}` : phone;

    const res = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SMS_API_KEY,
      },
      body: JSON.stringify({
        to: normalizedPhone,
        message: `Your Accessory verification code: ${otp}. Valid for 5 minutes.`,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[OTP] SMS send error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    // If OTP is disabled via env, bypass entirely
    if (process.env.SKIP_OTP === 'true') {
      return NextResponse.json({ data: { success: true, method: 'bypass', bypass: true, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() } });
    }

    // Rate limit: max 3 OTPs per phone per hour
    const rlResult = otpRateLimit(phone);
    if (!rlResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many OTP requests. Please wait before requesting a new code.',
          resetAt: new Date(rlResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // Also rate limit by IP
    const ip = getClientIP(req);
    const ipRl = otpRateLimit(`ip-${ip}`);
    if (!ipRl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests from this IP. Please try again later.' },
        { status: 429 }
      );
    }

    // Invalidate any existing unused OTPs for this phone
    await db.oTP.updateMany({ where: { phone, isUsed: false }, data: { isUsed: true } });

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    await db.oTP.create({ data: { phone, otp, expiresAt } });

    // Try WhatsApp first, fallback to SMS
    let method: 'whatsapp' | 'sms' | 'fallback' = 'fallback';
    const whatsappSent = await sendOTPViaWhatsApp(phone, otp);

    if (whatsappSent) {
      method = 'whatsapp';
    } else {
      const smsSent = await sendOTPViaSMS(phone, otp);
      if (smsSent) {
        method = 'sms';
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] OTP for ${phone}: ${otp}`);
        } else {
          return NextResponse.json(
            { error: 'Failed to send verification code. Please try again.' },
            { status: 503 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        data: {
          success: true,
          method,
          expiresAt: expiresAt.toISOString(),
          message: `Verification code sent via ${method}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/otp/send]', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
