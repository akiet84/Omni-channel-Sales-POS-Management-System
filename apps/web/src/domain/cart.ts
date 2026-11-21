import type { SKU } from '@omni-sales/shared-types';

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
