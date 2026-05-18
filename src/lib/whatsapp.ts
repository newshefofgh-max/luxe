import type { IOrder } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const WHATSAPP_ENABLED = process.env.ENABLE_WHATSAPP === 'true';
const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;

// ─── Order status labels (Arabic) ────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار ⏳',
  confirmed: 'مؤكد ✅',
  shipped: 'تم الشحن 🚚',
  delivered: 'تم التسليم 🎉',
  cancelled: 'ملغي ❌',
};

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Send a WhatsApp text message via Meta Cloud API.
 * Returns true on success, false on failure (non-throwing).
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  if (!WHATSAPP_ENABLED) return false;
  if (!WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('[WhatsApp] Missing API token or phone number ID — skipping send');
    return false;
  }

  // Normalize to international format without +: 01012345678 → 201012345678
  let normalizedPhone = to.replace(/^\+/, '').replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = '2' + normalizedPhone;

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: message,
    },
  };

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[WhatsApp] Send failed:', response.status, errorData);
      return false;
    }

    const data = await response.json();
    console.log(`[WhatsApp] Message sent to ${normalizedPhone}:`, data.messages?.[0]?.id);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Network error:', error);
    return false;
  }
}

// ─── Order confirmation to customer ──────────────────────────────────────────

/**
 * Send order confirmation message to the customer.
 */
export async function sendOrderConfirmationToCustomer(order: IOrder): Promise<void> {
  const { customer, orderNumber, total, items } = order;

  const itemsList = items
    .map(
      (item) =>
        `• ${item.productNameAr} × ${item.quantity} — ${item.price * item.quantity} جنيه`
    )
    .join('\n');

  const message = [
    `مرحباً ${customer.fullName}! 👋`,
    ``,
    `تم استلام طلبك رقم #${orderNumber} بنجاح ✅`,
    ``,
    `📦 تفاصيل الطلب:`,
    itemsList,
    ``,
    `💰 الإجمالي: ${total} جنيه`,
    `🚚 الشحن إلى: ${customer.governorate} - ${customer.city}`,
    ``,
    `سيتم التواصل معك قريباً لتأكيد الطلب.`,
    `شكراً لثقتك بنا! 💛`,
    ``,
    `Accessory 💍`,
  ].join('\n');

  const sent = await sendWhatsAppMessage(customer.phone, message);
  if (!sent) {
    console.warn(`[WhatsApp] Failed to send order confirmation to customer ${customer.phone}`);
  }
}

// ─── Order notification to admin ─────────────────────────────────────────────

/**
 * Notify the admin WhatsApp number about a new order.
 */
export async function sendOrderNotificationToAdmin(order: IOrder): Promise<void> {
  if (!ADMIN_WHATSAPP_NUMBER) {
    console.warn('[WhatsApp] ADMIN_WHATSAPP_NUMBER not configured');
    return;
  }

  const { customer, orderNumber, total, items, paymentMethod, shippingFee, discount } = order;

  const itemsList = items
    .map(
      (item) =>
        `• ${item.productNameAr} (${item.productName}) × ${item.quantity} — ${
          item.price * item.quantity
        } جنيه`
    )
    .join('\n');

  const variantLines = items
    .filter((item) => item.selectedVariants && Object.keys(item.selectedVariants).length > 0)
    .map(
      (item) =>
        `  [${item.productName}] ${Object.entries(item.selectedVariants ?? {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')}`
    )
    .join('\n');

  const lines: (string | null)[] = [
    `🛍️ طلب جديد! رقم #${orderNumber}`,
    ``,
    `👤 العميل: ${customer.fullName}`,
    `📱 الهاتف: ${customer.phone}`,
    customer.email ? `📧 الإيميل: ${customer.email}` : null,
    `📍 العنوان: ${customer.governorate} - ${customer.city}`,
    `   ${customer.address}`,
    ``,
    `📦 المنتجات:`,
    itemsList,
    variantLines ? `\n🔖 المتغيرات:\n${variantLines}` : null,
    ``,
    `💵 المجموع الفرعي: ${order.subtotal} جنيه`,
    `🚚 الشحن: ${shippingFee} جنيه`,
    discount > 0 ? `🏷️ الخصم: -${discount} جنيه` : null,
    `💰 الإجمالي: ${total} جنيه`,
    `💳 طريقة الدفع: ${
      paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'
    }`,
    order.couponCode ? `🎟️ كوبون: ${order.couponCode}` : null,
    order.notes ? `📝 ملاحظات: ${order.notes}` : null,
    ``,
    `⏰ ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`,
  ];

  const message = lines.filter((l): l is string => l !== null).join('\n');

  const sent = await sendWhatsAppMessage(ADMIN_WHATSAPP_NUMBER, message);
  if (!sent) {
    console.warn('[WhatsApp] Failed to send order notification to admin');
  }
}

// ─── Order status update to customer ─────────────────────────────────────────

/**
 * Send an order status update to the customer.
 */
export async function sendOrderStatusUpdate(
  phone: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
): Promise<void> {
  const statusLabel = STATUS_LABELS[status] ?? status;

  const lines = [
    `تحديث طلبك رقم #${orderNumber} 📬`,
    ``,
    `الحالة الجديدة: ${statusLabel}`,
  ];

  if (status === 'shipped' && trackingNumber) {
    lines.push(``, `رقم التتبع: ${trackingNumber}`);
    lines.push(`يمكنك تتبع شحنتك عبر موقع شركة الشحن.`);
  }

  if (status === 'delivered') {
    lines.push(``, `نتمنى أن تكون سعيداً بمشترياتك! 😊`);
    lines.push(`يسعدنا تقييمك لتجربة التسوق معنا.`);
  }

  if (status === 'cancelled') {
    lines.push(``, `نعتذر عن الإزعاج. للاستفسار يرجى التواصل معنا.`);
  }

  lines.push(``, `Accessory 💍`);

  const sent = await sendWhatsAppMessage(phone, lines.join('\n'));
  if (!sent) {
    console.warn(`[WhatsApp] Failed to send status update to ${phone}`);
  }
}

// ─── OTP via WhatsApp ─────────────────────────────────────────────────────────

/**
 * Send an OTP code via WhatsApp.
 */
export async function sendOTPViaWhatsApp(phone: string, otp: string): Promise<boolean> {
  const message = [
    `🔐 رمز التحقق الخاص بك في Accessory:`,
    ``,
    `*${otp}*`,
    ``,
    `صالح لمدة 5 دقائق فقط.`,
    `لا تشارك هذا الرمز مع أي شخص.`,
  ].join('\n');

  return sendWhatsAppMessage(phone, message);
}
