import type { IOTPRecord } from '@/types';
import { sendOTPViaWhatsApp } from './whatsapp';

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

// ─── In-memory OTP store ──────────────────────────────────────────────────────

// phone -> OTPRecord
const otpStore = new Map<string, IOTPRecord>();

// Clean up expired OTPs every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [phone, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(phone);
      }
    }
  }, 10 * 60 * 1000);
}

// ─── OTP Generation ───────────────────────────────────────────────────────────

/**
 * Generate a cryptographically-safe 6-digit OTP.
 * Uses Math.random() fallback if crypto is unavailable.
 */
export function generateOTP(): string {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    const num = (array[0]! % 900000) + 100000;
    return String(num).padStart(OTP_LENGTH, '0');
  }
  // Fallback
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

// ─── Store / Verify ───────────────────────────────────────────────────────────

/**
 * Store an OTP for a phone number with a 5-minute TTL.
 */
export async function storeOTP(phone: string, otp: string): Promise<void> {
  const record: IOTPRecord = {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
  otpStore.set(phone, record);
}

/**
 * Verify an OTP for a given phone number.
 * Deletes the record on success or when max attempts are exceeded.
 */
export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const record = otpStore.get(phone);

  if (!record) {
    return { success: false, error: 'لم يتم إرسال رمز تحقق لهذا الرقم' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' };
  }

  record.attempts += 1;

  if (record.attempts > OTP_MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'تجاوزت الحد الأقصى من المحاولات، يرجى طلب رمز جديد',
    };
  }

  if (record.otp !== otp) {
    return {
      success: false,
      error: `رمز التحقق غير صحيح. المحاولات المتبقية: ${OTP_MAX_ATTEMPTS - record.attempts}`,
    };
  }

  // Success — remove the record so it can't be reused
  otpStore.delete(phone);
  return { success: true };
}

/**
 * Check if an unexpired OTP already exists for a phone (to prevent spam).
 */
export function hasActiveOTP(phone: string): boolean {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  return true;
}

// ─── SMS via Unifonic ─────────────────────────────────────────────────────────

/**
 * Send an OTP via Unifonic SMS API.
 */
export async function sendOTPViaSMS(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env.SMS_API_KEY;
  const apiUrl = process.env.SMS_API_URL ?? 'https://api.unifonic.com/rest/SMS/messages';
  const senderId = process.env.SMS_SENDER_ID ?? 'Accessory';

  if (!apiKey) {
    console.warn('[SMS] SMS_API_KEY not configured — skipping SMS');
    return false;
  }

  const message = `رمز التحقق الخاص بك في Accessory: ${otp}\nصالح لمدة 5 دقائق.`;

  // Normalize to international format
  let normalizedPhone = phone.replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '2' + normalizedPhone; // Egypt country code
  }

  try {
    const formData = new URLSearchParams({
      AppSid: apiKey,
      SenderID: senderId,
      Body: message,
      Recipient: normalizedPhone,
      responseType: 'JSON',
      CorrelationID: '',
      baseEncode: 'false',
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error('[SMS] Send failed:', response.status);
      return false;
    }

    const data = await response.json();
    if (data.Success === 'True' || data.success === true) {
      console.log(`[SMS] OTP sent to ${normalizedPhone}`);
      return true;
    }

    console.error('[SMS] API returned failure:', data);
    return false;
  } catch (error) {
    console.error('[SMS] Network error:', error);
    return false;
  }
}

// ─── High-level: generate, store, and send OTP ───────────────────────────────

/**
 * Full OTP flow: generate → store → send via SMS (with WhatsApp fallback).
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  const otp = generateOTP();
  await storeOTP(phone, otp);

  // Try SMS first, fall back to WhatsApp
  const smsSent = await sendOTPViaSMS(phone, otp);
  if (smsSent) return { success: true };

  const waSent = await sendOTPViaWhatsApp(phone, otp);
  if (waSent) return { success: true };

  // In development, log the OTP so developers can test
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OTP DEV] OTP for ${phone}: ${otp}`);
    return { success: true };
  }

  // Both channels failed — clean up
  otpStore.delete(phone);
  return {
    success: false,
    error: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى',
  };
}
