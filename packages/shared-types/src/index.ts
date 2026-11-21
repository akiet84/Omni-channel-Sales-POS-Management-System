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
  available?: number;
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
 * Calculates discount amount clamped between 0 and baseAmount.
 * Safely guards against negative base amounts and non-finite / NaN values.
 */
export function calculateDiscountAmount(baseAmount: number, discount?: Discount): number {
  if (baseAmount <= 0 || !discount || !Number.isFinite(discount.value) || discount.value <= 0) {
    return 0;
  }
  if (discount.type === 'PERCENTAGE') {
    const pct = Math.min(100, Math.max(0, discount.value));
    return Math.round((baseAmount * pct) / 100);
  }
  if (discount.type === 'FIXED') {
    return Math.min(baseAmount, Math.max(0, discount.value));
  }
  return 0;
}

/**
 * Calculates line total, handling percentage or fixed discounts.
 * Capped so discount cannot exceed rawTotal, and percentage is clamped between 0 and 100.
 */
export function calculateLineTotal(item: CartItem): LineTotalCalculation {
  const rawTotal = item.sku.price * item.quantity;
  const discountAmount = calculateDiscountAmount(rawTotal, item.discount);
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
  const orderDiscountAmount = calculateDiscountAmount(subtotalAfterLines, orderDiscount);
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
 * Resolves available inventory for a SKU, strictly upholding Available = max(0, onHand - reserved).
 */
export function getAvailableInventory(sku: SKU): number {
  if (!sku.inventory) return 0;
  if (
    typeof sku.inventory.onHand === 'number' &&
    typeof sku.inventory.reserved === 'number'
  ) {
    return Math.max(0, sku.inventory.onHand - sku.inventory.reserved);
  }
  if (typeof sku.inventory.available === 'number') {
    return Math.max(0, sku.inventory.available);
  }
  return 0;
}

/**
 * Validates if quantity can be added, incremented, or decremented based on Available Inventory.
 * Strictly enforces domain invariant: Available = max(0, OnHand - Reserved).
 */
export function canAdjustQuantity(item: CartItem, delta: number): boolean {
  const targetQuantity = item.quantity + delta;

  if (targetQuantity <= 0) {
    return false;
  }

  if (delta < 0) {
    return true;
  }

  const available = getAvailableInventory(item.sku);
  return targetQuantity <= available;
}

export const canAddOrIncrement = canAdjustQuantity;

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
