/**
 * Shared Domain Types for Omni-channel Sales & POS Management System
 * Conforms to GLOSSARY.md and ADRs 0001 - 0005.
 */

export type SalesChannelType = 'POS' | 'SHOPEE' | 'LAZADA' | 'TIKTOK_SHOP' | 'WEB';

export interface SalesChannel {
  id: string;
  name: string;
  type: SalesChannelType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  skus?: SKU[];
}

export interface SKU {
  id: string;
  productId: string;
  skuCode: string;
  barcode: string;
  name: string;
  variantAttributes: Record<string, string>;
  price: number;
  costPrice?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  inventory?: InventoryBalance;
}

export interface InventoryBalance {
  id: string;
  skuId: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'VIETQR';

export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  skuCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  channelId: string;
  customerId?: string;
  cashierId?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountTendered?: number;
  changeGiven?: number;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  customer?: Customer;
  channel?: SalesChannel;
}

// ---------------------------------------------------------
// Pricing, Discounts & Cart Domain
// ---------------------------------------------------------

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Discount {
  type: DiscountType;
  value: number;
}

export interface CartItem {
  sku: SKU;
  quantity: number;
  discount?: Discount;
}

export interface CartTotals {
  rawSubtotal: number;
  lineDiscountTotal: number;
  subtotalAfterLines: number;
  orderDiscountAmount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  totalPayable: number;
}

export interface LineTotalCalculation {
  rawTotal: number;
  discountAmount: number;
  finalTotal: number;
}

/**
 * Calculates line total, handling percentage or fixed discounts.
 * Capped so discount cannot exceed rawTotal, and percentage is clamped between 0 and 100.
 */
export function calculateLineTotal(item: CartItem): LineTotalCalculation {
  const rawTotal = item.sku.price * item.quantity;
  let discountAmount = 0;

  if (item.discount && item.discount.value > 0) {
    if (item.discount.type === 'PERCENTAGE') {
      const pct = Math.min(100, Math.max(0, item.discount.value));
      discountAmount = Math.round((rawTotal * pct) / 100);
    } else if (item.discount.type === 'FIXED') {
      discountAmount = Math.min(rawTotal, Math.max(0, item.discount.value));
    }
  }

  const finalTotal = Math.max(0, rawTotal - discountAmount);

  return {
    rawTotal,
    discountAmount,
    finalTotal,
  };
}

/**
 * Calculates cart totals including line discounts, order discount, taxable amount, VAT, and total payable.
 */
export function calculateCartTotals(
  items: CartItem[],
  orderDiscount?: Discount,
  vatRate = 0.10
): CartTotals {
  let rawSubtotal = 0;
  let lineDiscountTotal = 0;

  for (const item of items) {
    const line = calculateLineTotal(item);
    rawSubtotal += line.rawTotal;
    lineDiscountTotal += line.discountAmount;
  }

  const subtotalAfterLines = Math.max(0, rawSubtotal - lineDiscountTotal);
  let orderDiscountAmount = 0;

  if (orderDiscount && orderDiscount.value > 0) {
    if (orderDiscount.type === 'PERCENTAGE') {
      const pct = Math.min(100, Math.max(0, orderDiscount.value));
      orderDiscountAmount = Math.round((subtotalAfterLines * pct) / 100);
    } else if (orderDiscount.type === 'FIXED') {
      orderDiscountAmount = Math.min(subtotalAfterLines, Math.max(0, orderDiscount.value));
    }
  }

  const taxableAmount = Math.max(0, subtotalAfterLines - orderDiscountAmount);
  const vatAmount = Math.round(taxableAmount * vatRate);
  const totalPayable = taxableAmount + vatAmount;

  return {
    rawSubtotal,
    lineDiscountTotal,
    subtotalAfterLines,
    orderDiscountAmount,
    taxableAmount,
    vatRate,
    vatAmount,
    totalPayable,
  };
}

/**
 * Validates if quantity can be added or incremented based on Available Inventory.
 * Available = OnHand - Reserved.
 */
export function canAddOrIncrement(item: CartItem, delta: number): boolean {
  const available = item.sku.inventory?.available ?? 0;
  const targetQuantity = item.quantity + delta;

  if (targetQuantity <= 0) {
    return false;
  }

  return targetQuantity <= available;
}

// ---------------------------------------------------------
// Checkout & Order DTOs
// ---------------------------------------------------------

export interface CreatePOSOrderItemDTO {
  skuId: string;
  quantity: number;
  discount?: Discount;
}

export interface CreatePOSOrderDTO {
  channelId?: string;
  customerId?: string;
  cashierId?: string;
  items: CreatePOSOrderItemDTO[];
  orderDiscount?: Discount;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  notes?: string;
}

export interface CheckoutResultDTO {
  success: boolean;
  order: Order;
  changeGiven: number;
}

// ---------------------------------------------------------
// Domain Events (for Outbound Sync & Queue Processing)
// ---------------------------------------------------------

export interface InventoryChangedEvent {
  skuId: string;
  skuCode: string;
  previousOnHand: number;
  newOnHand: number;
  previousReserved: number;
  newReserved: number;
  previousAvailable: number;
  newAvailable: number;
  reason: 'POS_CHECKOUT' | 'WEBHOOK_ORDER' | 'ORDER_CANCELLED' | 'RETURN' | 'MANUAL_ADJUST';
  timestamp: Date;
}
