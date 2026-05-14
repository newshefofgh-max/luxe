import type { IOrder, IShippingRate } from '@/types';

// ─── Shipping Rates — All 27 Egyptian Governorates ───────────────────────────

export const SHIPPING_RATES: Record<string, IShippingRate> = {
  'القاهرة':      { governorate: 'القاهرة',      fee: 50,  estimatedDays: '1-2' },
  'الجيزة':       { governorate: 'الجيزة',        fee: 55,  estimatedDays: '1-2' },
  'الإسكندرية':   { governorate: 'الإسكندرية',    fee: 60,  estimatedDays: '2-3' },
  'الدقهلية':     { governorate: 'الدقهلية',      fee: 65,  estimatedDays: '2-3' },
  'البحر الأحمر': { governorate: 'البحر الأحمر',  fee: 85,  estimatedDays: '3-5' },
  'البحيرة':      { governorate: 'البحيرة',       fee: 65,  estimatedDays: '2-3' },
  'الفيوم':       { governorate: 'الفيوم',        fee: 70,  estimatedDays: '2-3' },
  'الغربية':      { governorate: 'الغربية',       fee: 65,  estimatedDays: '2-3' },
  'الإسماعيلية':  { governorate: 'الإسماعيلية',   fee: 70,  estimatedDays: '2-3' },
  'المنوفية':     { governorate: 'المنوفية',      fee: 65,  estimatedDays: '2-3' },
  'المنيا':       { governorate: 'المنيا',        fee: 75,  estimatedDays: '3-4' },
  'القليوبية':    { governorate: 'القليوبية',     fee: 55,  estimatedDays: '1-2' },
  'الوادي الجديد':{ governorate: 'الوادي الجديد', fee: 90,  estimatedDays: '4-6' },
  'السويس':       { governorate: 'السويس',        fee: 70,  estimatedDays: '2-3' },
  'أسوان':        { governorate: 'أسوان',         fee: 80,  estimatedDays: '3-5' },
  'أسيوط':        { governorate: 'أسيوط',         fee: 75,  estimatedDays: '3-4' },
  'بني سويف':     { governorate: 'بني سويف',      fee: 70,  estimatedDays: '2-3' },
  'بورسعيد':      { governorate: 'بورسعيد',       fee: 70,  estimatedDays: '2-3' },
  'دمياط':        { governorate: 'دمياط',         fee: 65,  estimatedDays: '2-3' },
  'الشرقية':      { governorate: 'الشرقية',       fee: 60,  estimatedDays: '2-3' },
  'جنوب سيناء':   { governorate: 'جنوب سيناء',    fee: 90,  estimatedDays: '4-6' },
  'كفر الشيخ':    { governorate: 'كفر الشيخ',     fee: 65,  estimatedDays: '2-3' },
  'مطروح':        { governorate: 'مطروح',         fee: 85,  estimatedDays: '3-5' },
  'الأقصر':       { governorate: 'الأقصر',        fee: 80,  estimatedDays: '3-5' },
  'قنا':          { governorate: 'قنا',           fee: 80,  estimatedDays: '3-5' },
  'شمال سيناء':   { governorate: 'شمال سيناء',    fee: 85,  estimatedDays: '3-5' },
  'سوهاج':        { governorate: 'سوهاج',         fee: 75,  estimatedDays: '3-4' },
};

const DEFAULT_SHIPPING_FEE = 75;

// ─── Fee Calculation ──────────────────────────────────────────────────────────

/**
 * Get the shipping fee for a given governorate.
 * Falls back to a default fee if the governorate is not found.
 */
export function calculateShippingFee(governorate: string): number {
  const rate = SHIPPING_RATES[governorate];
  return rate?.fee ?? DEFAULT_SHIPPING_FEE;
}

/**
 * Get the estimated delivery days for a given governorate.
 */
export function getEstimatedDelivery(governorate: string): string {
  const rate = SHIPPING_RATES[governorate];
  return rate?.estimatedDays ?? '3-5';
}

// ─── Bosta API Integration ────────────────────────────────────────────────────

const BOSTA_ENABLED = process.env.ENABLE_BOSTA_SHIPPING === 'true';
const BOSTA_API_URL = process.env.BOSTA_API_URL ?? 'https://app.bosta.co/api/v2';
const BOSTA_API_KEY = process.env.BOSTA_API_KEY;

interface BostaCreateDeliveryPayload {
  type: number; // 10 = Send, 25 = Return
  specs: {
    packageDetails: {
      itemsCount: number;
      description: string;
    };
  };
  notes: string;
  cod: number; // Cash on delivery amount
  dropOffAddress: {
    city: string;
    firstLine: string;
  };
  receiver: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  businessReference?: string;
}

interface BostaCreateDeliveryResponse {
  _id: string;
  trackingNumber: string;
  state: {
    value: number;
    code: string;
  };
}

/**
 * Create a shipment in Bosta.
 */
export async function createBostaShipment(
  order: IOrder
): Promise<{ trackingNumber: string; bostaOrderId: string }> {
  if (!BOSTA_ENABLED) throw new Error('Bosta shipping is disabled (ENABLE_BOSTA_SHIPPING=false)');
  if (!BOSTA_API_KEY) throw new Error('BOSTA_API_KEY is not configured');

  const nameParts = order.customer.fullName.split(' ');
  const firstName = nameParts[0] ?? order.customer.fullName;
  const lastName = nameParts.slice(1).join(' ') || '-';

  const itemsDescription = order.items
    .map((item) => `${item.productName} x${item.quantity}`)
    .join(', ');

  const payload: BostaCreateDeliveryPayload = {
    type: 10, // SEND type
    specs: {
      packageDetails: {
        itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        description: itemsDescription,
      },
    },
    notes: order.notes ?? '',
    cod: order.paymentMethod === 'cod' ? order.total : 0,
    dropOffAddress: {
      city: order.customer.city,
      firstLine: order.customer.address,
    },
    receiver: {
      firstName,
      lastName,
      phone: order.customer.phone,
    },
    businessReference: order.orderNumber,
  };

  const response = await fetch(`${BOSTA_API_URL}/deliveries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BOSTA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Bosta create shipment failed: ${response.status} — ${JSON.stringify(error)}`
    );
  }

  const data: BostaCreateDeliveryResponse = await response.json();

  return {
    trackingNumber: data.trackingNumber,
    bostaOrderId: data._id,
  };
}

/**
 * Get the current status of a Bosta shipment.
 */
export async function getBostaShipmentStatus(trackingNumber: string): Promise<string> {
  if (!BOSTA_API_KEY) {
    throw new Error('BOSTA_API_KEY is not configured');
  }

  const response = await fetch(
    `${BOSTA_API_URL}/deliveries/tracking/${trackingNumber}`,
    {
      headers: {
        Authorization: `Bearer ${BOSTA_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Bosta tracking failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.state?.code ?? 'UNKNOWN';
}

/**
 * Cancel a Bosta shipment.
 */
export async function cancelBostaShipment(trackingNumber: string): Promise<boolean> {
  if (!BOSTA_API_KEY) {
    throw new Error('BOSTA_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `${BOSTA_API_URL}/deliveries/${trackingNumber}/terminate`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${BOSTA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('[Bosta] Cancel shipment error:', error);
    return false;
  }
}

// ─── Bosta status code → order status mapping ────────────────────────────────

const BOSTA_STATUS_MAP: Record<string, string> = {
  PACKAGE_RECEIVED: 'confirmed',
  IN_TRANSIT: 'shipped',
  OUT_FOR_DELIVERY: 'shipped',
  DELIVERED: 'delivered',
  WAITING_FOR_CUSTOMER_ACTION: 'pending',
  RETURNED: 'cancelled',
  CANCELLED: 'cancelled',
};

export function mapBostaStatusToOrderStatus(bostaCode: string): string {
  return BOSTA_STATUS_MAP[bostaCode] ?? 'shipped';
}
