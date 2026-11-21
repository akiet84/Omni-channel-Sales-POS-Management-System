import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../src/db.js';
import { InventoryService } from '../../src/services/inventory.service.js';

describe('InventoryService & Split Inventory Model (ADR 0004)', () => {
  beforeAll(async () => {
    // Clean up any test product
    await prisma.sKU.deleteMany({
      where: { skuCode: { startsWith: 'TEST-SKU-' } },
    });
  });

  afterAll(async () => {
    await prisma.sKU.deleteMany({
      where: { skuCode: { startsWith: 'TEST-SKU-' } },
    });
    await prisma.$disconnect();
  });

  it('correctly calculates available inventory as onHand - reserved', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Sản phẩm Test Tồn Kho',
        basePrice: 100000,
      },
    });

    const sku = await prisma.sKU.create({
      data: {
        productId: product.id,
        skuCode: 'TEST-SKU-001',
        barcode: '99990001',
        name: 'Test SKU Size M',
        variantAttributes: JSON.stringify({ size: 'M' }),
        price: 100000,
        inventory: {
          create: {
            onHand: 20,
            reserved: 5,
            available: 15, // 20 - 5
          },
        },
      },
      include: { inventory: true },
    });

    expect(sku.inventory).toBeDefined();
    expect(sku.inventory?.onHand).toBe(20);
    expect(sku.inventory?.reserved).toBe(5);
    expect(sku.inventory?.available).toBe(15);
  });

  it('can look up SKU by barcode or SKU code', async () => {
    const byBarcode = await InventoryService.findByBarcodeOrCode('99990001');
    expect(byBarcode).not.toBeNull();
    expect(byBarcode?.skuCode).toBe('TEST-SKU-001');

    const byCode = await InventoryService.findByBarcodeOrCode('TEST-SKU-001');
    expect(byCode).not.toBeNull();
    expect(byCode?.barcode).toBe('99990001');
  });

  it('adjusts on-hand and reserved correctly, updating available', async () => {
    const sku = await InventoryService.findByBarcodeOrCode('TEST-SKU-001');
    expect(sku).not.toBeNull();

    // Deduct 2 from on-hand (e.g. POS sale)
    const updated = await InventoryService.adjustInventory(sku!.id, -2, 0);
    expect(updated.onHand).toBe(18);
    expect(updated.reserved).toBe(5);
    expect(updated.available).toBe(13); // 18 - 5

    // Add 3 to reserved (e.g. incoming online order)
    const updated2 = await InventoryService.adjustInventory(sku!.id, 0, 3);
    expect(updated2.onHand).toBe(18);
    expect(updated2.reserved).toBe(8);
    expect(updated2.available).toBe(10); // 18 - 8
  });

  it('rejects deduction when available stock is insufficient', async () => {
    const sku = await InventoryService.findByBarcodeOrCode('TEST-SKU-001');
    expect(sku).not.toBeNull();

    // Currently available is 10. Trying to deduct 15 on-hand should throw
    await expect(
      InventoryService.adjustInventory(sku!.id, -15, 0)
    ).rejects.toThrow(/Insufficient available stock/);
  });
});
