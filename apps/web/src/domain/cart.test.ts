import { describe, it, expect } from 'vitest';
import type { SKU } from '@omni-sales/shared-types';
import {
  calculateLineTotal,
  calculateCartTotals,
  canAddOrIncrement,
  type CartItem,
} from './cart';

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
          quantity: 2, // 400_000 - 10% = 360_000
          discount: { type: 'PERCENTAGE', value: 10 },
        },
        {
          sku: mockSkuB,
          quantity: 1, // 500_000 - 50_000 = 450_000
          discount: { type: 'FIXED', value: 50_000 },
        },
      ];

      // rawSubtotal = 400_000 + 500_000 = 900_000
      // lineDiscountTotal = 40_000 + 50_000 = 90_000
      // subtotalAfterLines = 810_000
      // orderDiscount = 10_000
      // taxableAmount = 800_000
      // vatAmount (10%) = 80_000
      // totalPayable = 880_000
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
  });

  describe('canAddOrIncrement', () => {
    it('permits adding or incrementing within available inventory limit', () => {
      const item: CartItem = { sku: mockSkuA, quantity: 5 }; // available = 7
      expect(canAddOrIncrement(item, 1)).toBe(true);
      expect(canAddOrIncrement(item, 2)).toBe(true);
      expect(canAddOrIncrement(item, 3)).toBe(false); // exceeds 7
    });

    it('rejects decrementing to 0 or below', () => {
      const item: CartItem = { sku: mockSkuA, quantity: 1 };
      expect(canAddOrIncrement(item, -1)).toBe(false);
    });

    it('handles SKU with no inventory recorded gracefully', () => {
      const skuWithoutInventory: SKU = { ...mockSkuA, inventory: undefined };
      const item: CartItem = { sku: skuWithoutInventory, quantity: 1 };
      expect(canAddOrIncrement(item, 1)).toBe(false);
    });
  });
});
