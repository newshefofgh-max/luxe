import { z } from 'zod';

// ─── Shared Primitives ────────────────────────────────────────────────────────

export const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;

const egyptianPhone = z
  .string()
  .regex(
    egyptianPhoneRegex,
    'رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم'
  );

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
] as const;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('بريد إلكتروني غير صالح').toLowerCase(),
  phone: egyptianPhone,
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل'),
});

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح').toLowerCase(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ─── Checkout Schema ──────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً'),
  phone: egyptianPhone,
  email: z.string().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  address: z
    .string()
    .min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل')
    .max(500, 'العنوان طويل جداً'),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['cod', 'online']).default('cod'),
  couponCode: z.string().max(50).optional(),
});

// ─── Product Schema ───────────────────────────────────────────────────────────

export const variantOptionSchema = z.object({
  value: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  priceModifier: z.number().default(0),
});

export const variantSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  options: z.array(variantOptionSchema).min(1),
});

export const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج يجب أن يكون حرفين على الأقل'),
  nameAr: z.string().min(2, 'اسم المنتج بالعربي يجب أن يكون حرفين على الأقل'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  descriptionAr: z.string().min(10, 'الوصف بالعربي يجب أن يكون 10 أحرف على الأقل'),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  comparePrice: z.number().positive().optional(),
  category: z.string().min(1, 'الفئة مطلوبة'),
  stock: z.number().int().min(0, 'الكمية لا يمكن أن تكون سالبة'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
});

// ─── Coupon Schema ────────────────────────────────────────────────────────────

export const couponSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('قيمة الكوبون يجب أن تكون أكبر من صفر'),
  minOrderValue: z.number().min(0).default(0),
  maxUses: z.number().int().positive(),
  expiresAt: z.string().datetime(),
  isActive: z.boolean().default(true),
});

// ─── OTP Schemas ──────────────────────────────────────────────────────────────

export const sendOtpSchema = z.object({
  phone: egyptianPhone,
});

export const verifyOtpSchema = z.object({
  phone: egyptianPhone,
  otp: z.string().length(6, 'رمز OTP يجب أن يكون 6 أرقام').regex(/^\d{6}$/),
});

// ─── Update Order Schema ──────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  shippingProvider: z.string().optional(),
  cancelReason: z.string().optional(),
});

// ─── Address Schema ───────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().min(1, 'تسمية العنوان مطلوبة').max(50),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
  isDefault: z.boolean().default(false),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate an Egyptian phone number and return cleaned version.
 */
export function validateEgyptianPhone(phone: string): boolean {
  return egyptianPhoneRegex.test(phone.replace(/\s/g, ''));
}
