import { NextRequest } from 'next/server';

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_ORDERS_PER_IP_PER_DAY = 5;
export const MAX_OTP_PER_PHONE_PER_DAY = 10;
export const MAX_API_PER_IP_PER_MINUTE = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ─── In-memory store ──────────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);
}

// ─── Core rate limit function ─────────────────────────────────────────────────

/**
 * Sliding-window rate limiter backed by an in-memory Map.
 * For multi-instance deployments swap the store with a Redis client.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  entry.count += 1;
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return { allowed, remaining, resetAt: entry.resetAt };
}

// Keep legacy alias
export const rateLimit = (key: string, options: RateLimitOptions): RateLimitResult =>
  checkRateLimit(key, options.limit, options.windowMs);

// ─── IP extraction ────────────────────────────────────────────────────────────

export function getRateLimitKey(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

// Keep legacy alias
export const getClientIP = getRateLimitKey;

// ─── Preset helpers ───────────────────────────────────────────────────────────

/** 5 orders per IP per day (anti-fake-order protection) */
export function orderRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(
    `order:${ip}`,
    MAX_ORDERS_PER_IP_PER_DAY,
    24 * 60 * 60 * 1000
  );
}

/** 10 OTP requests per phone per day */
export function otpRateLimit(phone: string): RateLimitResult {
  return checkRateLimit(
    `otp:${phone}`,
    MAX_OTP_PER_PHONE_PER_DAY,
    24 * 60 * 60 * 1000
  );
}

/** 60 general API calls per IP per minute */
export function apiRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(
    `api:${ip}`,
    MAX_API_PER_IP_PER_MINUTE,
    60 * 1000
  );
}

/** Auth endpoints — stricter: 10 attempts per IP per 15 minutes */
export function authRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`auth:${ip}`, 10, 15 * 60 * 1000);
}

/** Coupon validation — 20 attempts per IP per 10 minutes (anti-bruteforce) */
export function couponRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`coupon:${ip}`, 20, 10 * 60 * 1000);
}
