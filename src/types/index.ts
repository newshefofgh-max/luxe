// ─── Product Types ───────────────────────────────────────────────────────────

export interface IVariantOption {
  value: string;
  stock: number;
  priceModifier: number;
}

export interface IVariant {
  name: string;
  nameAr: string;
  options: IVariantOption[];
}

export interface IProduct {
  _id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  variants: IVariant[];
  stock: number;
  sold: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'online';

export interface ICustomer {
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  city: string;
  address: string;
  userId?: string;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: ICustomer;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  cancelReason?: string;
  ipAddress?: string;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface ICartItem {
  productId: string;
  product: IProduct;
  quantity: number;
  selectedVariants?: Record<string, string>;
  price: number;
}

export interface ICart {
  items: ICartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface ISavedAddress {
  label: string;
  governorate: string;
  city: string;
  address: string;
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  savedAddresses: ISavedAddress[];
  createdAt: string;
}

// ─── Coupon Types ─────────────────────────────────────────────────────────────

export interface ICouponUsage {
  userId: string;
  orderId: string;
  usedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  usedBy: ICouponUsage[];
  expiresAt: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Shipping Types ───────────────────────────────────────────────────────────

export interface IShippingRate {
  governorate: string;
  fee: number;
  estimatedDays: string;
}

export interface IBostaShipmentResult {
  trackingNumber: string;
  bostaOrderId: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface ITopProduct {
  product: IProduct;
  count: number;
}

export interface IDailyRevenue {
  date: string;
  revenue: number;
}

export interface IAnalyticsSummary {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  collectedRevenue: number;
  conversionRate: number;
  fakeOrderRate: number;
  topProducts: ITopProduct[];
  revenueByDay: IDailyRevenue[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface ICheckoutForm {
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface IRegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ILoginForm {
  email: string;
  password: string;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export interface IWhatsAppMessage {
  to: string;
  message: string;
}

export interface IOTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface IProductFilters {
  category?: IProduct['category'];
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface IOrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
