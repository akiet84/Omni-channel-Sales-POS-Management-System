import { describe, it, expect } from 'vitest';
import {
  type SKU,
  type CartItem,
  getAvailableInventory,
  calculateDiscountAmount,
  calculateLineTotal,
  calculateCartTotals,
  canAddOrIncrement,
  canAdjustQuantity,
} from '@omni-sales/shared-types';

const mockSkuA: SKU = {
  id: 'sku-1',
  productId: 'prod-1',
  skuCode: 'TSHIRT-BLK-L',
  barcode: '893000000001',
  name: 'Áo Thun Basic Đen L',
  variantAttributes: { color: 'Đen', size: 'L' },
  price: 200_000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  inventory: {
    id: 'inv-1',
    skuId: 'sku-1',
    onHand: 10,
    reserved: 3,
    available: 7,
    updatedAt: new Date(),
  },
};

const mockSkuB: SKU = {
  id: 'sku-2',
  productId: 'prod-2',
  skuCode: 'JEAN-BLU-32',
  barcode: '893000000002',
  name: 'Quần Jean Slimfit Xanh 32',
  variantAttributes: { color: 'Xanh', size: '32' },
  price: 500_000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  inventory: {
    id: 'inv-2',
    skuId: 'sku-2',
    onHand: 5,
    reserved: 0,
    available: 5,
    updatedAt: new Date(),
  },
};

describe('Cart Domain Calculations', () => {
  describe('getAvailableInventory', () => {
    it('returns 0 when inventory is undefined', () => {
      expect(getAvailableInventory({ ...mockSkuA, inventory: undefined })).toBe(0);
    });

    it('calculates available as onHand - reserved', () => {
      expect(getAvailableInventory(mockSkuA)).toBe(7);
    });

    it('enforces non-negative available when reserved exceeds onHand', () => {
      const overReserved: SKU = {
        ...mockSkuA,
        inventory: {
          id: 'inv-neg',
          skuId: 'sku-1',
          onHand: 2,
          reserved: 5,
          available: 0,
          updatedAt: new Date(),
        },
      };
      expect(getAvailableInventory(overReserved)).toBe(0);
    });
  });

  describe('calculateDiscountAmount', () => {
    it('returns 0 when discount is undefined or value <= 0', () => {
      expect(calculateDiscountAmount(100_000, undefined)).toBe(0);
      expect(calculateDiscountAmount(100_000, { type: 'FIXED', value: 0 })).toBe(0);
      expect(calculateDiscountAmount(100_000, { type: 'PERCENTAGE', value: -10 })).toBe(0);
    });

    it('returns 0 when discount value is NaN or not finite', () => {
      expect(calculateDiscountAmount(100_000, { type: 'PERCENTAGE', value: NaN })).toBe(0);
      expect(calculateDiscountAmount(100_000, { type: 'FIXED', value: NaN })).toBe(0);
      expect(calculateDiscountAmount(100_000, { type: 'PERCENTAGE', value: Infinity })).toBe(0);
    });

    it('returns 0 when base amount is <= 0', () => {
      expect(calculateDiscountAmount(-100_000, { type: 'FIXED', value: 50_000 })).toBe(0);
      expect(calculateDiscountAmount(0, { type: 'FIXED', value: 50_000 })).toBe(0);
      expect(calculateDiscountAmount(-100_000, { type: 'PERCENTAGE', value: 10 })).toBe(0);
    });
  });

  describe('calculateLineTotal', () => {
    it('calculates line total without discount', () => {
      const item: CartItem = { sku: mockSkuA, quantity: 2 };
      const result = calculateLineTotal(item);

      expect(result.rawTotal).toBe(400_000);
      expect(result.discountAmount).toBe(0);
      expect(result.finalTotal).toBe(400_000);
    });

    it('calculates line total with percentage discount', () => {
      const item: CartItem = {
        sku: mockSkuA,
        quantity: 2,
        discount: { type: 'PERCENTAGE', value: 10 },
      };
      const result = calculateLineTotal(item);

      expect(result.rawTotal).toBe(400_000);
      expect(result.discountAmount).toBe(40_000);
      expect(result.finalTotal).toBe(360_000);
    });

    it('calculates line total with fixed discount capped at line raw total', () => {
      const item: CartItem = {
        sku: mockSkuA,
        quantity: 1,
        discount: { type: 'FIXED', value: 250_000 },
      };
      const result = calculateLineTotal(item);

      expect(result.rawTotal).toBe(200_000);
      expect(result.discountAmount).toBe(200_000);
      expect(result.finalTotal).toBe(0);
    });
  });

  describe('calculateCartTotals', () => {
    it('calculates totals with multiple items, line discounts, order discount and VAT', () => {
      const items: CartItem[] = [
        {
          sku: mockSkuA,
          quantity: 2,
          discount: { type: 'PERCENTAGE', value: 10 },
        },
        {
          sku: mockSkuB,
          quantity: 1,
          discount: { type: 'FIXED', value: 50_000 },
        },
      ];

      const totals = calculateCartTotals(items, { type: 'FIXED', value: 10_000 }, 0.10);

      expect(totals.rawSubtotal).toBe(900_000);
      expect(totals.lineDiscountTotal).toBe(90_000);
      expect(totals.subtotalAfterLines).toBe(810_000);
      expect(totals.orderDiscountAmount).toBe(10_000);
      expect(totals.taxableAmount).toBe(800_000);
      expect(totals.vatRate).toBe(0.10);
      expect(totals.vatAmount).toBe(80_000);
      expect(totals.totalPayable).toBe(880_000);
    });

    it('handles empty cart correctly', () => {
      const totals = calculateCartTotals([]);
      expect(totals.rawSubtotal).toBe(0);
      expect(totals.lineDiscountTotal).toBe(0);
      expect(totals.subtotalAfterLines).toBe(0);
      expect(totals.taxableAmount).toBe(0);
      expect(totals.vatAmount).toBe(0);
      expect(totals.totalPayable).toBe(0);
    });

    it('does not poison cart totals with NaN when discount value is NaN', () => {
      const items: CartItem[] = [
        {
          sku: mockSkuA,
          quantity: 1,
          discount: { type: 'PERCENTAGE', value: NaN },
        },
      ];
      const totals = calculateCartTotals(items, { type: 'FIXED', value: NaN });

      expect(Number.isNaN(totals.lineDiscountTotal)).toBe(false);
      expect(Number.isNaN(totals.orderDiscountAmount)).toBe(false);
      expect(Number.isNaN(totals.totalPayable)).toBe(false);
      expect(totals.lineDiscountTotal).toBe(0);
      expect(totals.orderDiscountAmount).toBe(0);
      expect(totals.totalPayable).toBe(220_000);
    });
  });

  describe('canAdjustQuantity / canAddOrIncrement', () => {
    it('permits adding or incrementing within available inventory limit', () => {
      const item: CartItem = { sku: mockSkuA, quantity: 5 };
      expect(canAdjustQuantity(item, 1)).toBe(true);
      expect(canAdjustQuantity(item, 2)).toBe(true);
      expect(canAdjustQuantity(item, 3)).toBe(false);
      expect(canAddOrIncrement(item, 1)).toBe(true);
    });

    it('rejects decrementing to 0 or below', () => {
      const item: CartItem = { sku: mockSkuA, quantity: 1 };
      expect(canAdjustQuantity(item, -1)).toBe(false);
    });

    it('handles SKU with no inventory recorded gracefully', () => {
      const skuWithoutInventory: SKU = { ...mockSkuA, inventory: undefined };
      const item: CartItem = { sku: skuWithoutInventory, quantity: 1 };
      expect(canAdjustQuantity(item, 1)).toBe(false);
    });

    it('enforces available = onHand - reserved even if available field is desynced or missing', () => {
      const desyncedSku: SKU = {
        ...mockSkuA,
        inventory: {
          id: 'inv-desync',
          skuId: 'sku-1',
          onHand: 10,
          reserved: 10,
          available: 5,
          updatedAt: new Date(),
        },
      };
      const item: CartItem = { sku: desyncedSku, quantity: 1 };
      expect(canAdjustQuantity(item, 1)).toBe(false);
    });

    it('correctly computes available when available property is omitted/undefined', () => {
      const omittedAvailableSku: SKU = {
        ...mockSkuA,
        inventory: {
          id: 'inv-omitted',
          skuId: 'sku-1',
          onHand: 10,
          reserved: 2,
          updatedAt: new Date(),
        },
      };
      const item: CartItem = { sku: omittedAvailableSku, quantity: 1 };
      expect(canAdjustQuantity(item, 1)).toBe(true);
    });

    it('allows decrementing quantity (delta < 0) even if current quantity exceeds current available stock', () => {
      const reducedStockSku: SKU = {
        ...mockSkuA,
        inventory: {
          id: 'inv-reduced',
          skuId: 'sku-1',
          onHand: 5,
          reserved: 3,
          available: 2,
          updatedAt: new Date(),
        },
      };
      const item: CartItem = { sku: reducedStockSku, quantity: 4 };
      expect(canAdjustQuantity(item, -1)).toBe(true);
      expect(canAdjustQuantity(item, 1)).toBe(false);
    });
  });
});
