import { prisma } from '../db.js';

export class InventoryService {
  static async getSkuWithInventory(skuId: string) {
    return prisma.sKU.findUnique({
      where: { id: skuId },
      include: {
        inventory: true,
        product: true,
      },
    });
  }

  static async findByBarcodeOrCode(code: string) {
    return prisma.sKU.findFirst({
      where: {
        OR: [{ barcode: code }, { skuCode: code }],
        isActive: true,
      },
      include: {
        inventory: true,
        product: true,
      },
    });
  }

  static async listSkus(query?: string) {
    return prisma.sKU.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { skuCode: { contains: query } },
              { barcode: { contains: query } },
              { product: { name: { contains: query } } },
            ],
            isActive: true,
          }
        : { isActive: true },
      include: {
        inventory: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async adjustInventory(
    skuId: string,
    onHandDelta: number = 0,
    reservedDelta: number = 0
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.inventoryBalance.findUnique({
        where: { skuId },
      });

      if (!current) {
        throw new Error(`Inventory balance record not found for SKU: ${skuId}`);
      }

      const newOnHand = current.onHand + onHandDelta;
      const newReserved = current.reserved + reservedDelta;
      const newAvailable = newOnHand - newReserved;

      if (newOnHand < 0) {
        throw new Error(
          `Insufficient on-hand stock for SKU: ${skuId} (current: ${current.onHand}, delta: ${onHandDelta})`
        );
      }
      if (newReserved < 0) {
        throw new Error(
          `Invalid reserved stock for SKU: ${skuId}: reserved cannot be negative (current: ${current.reserved}, delta: ${reservedDelta})`
        );
      }
      if (newAvailable < 0) {
        throw new Error(
          `Insufficient available stock for SKU: ${skuId} (current available: ${current.available}, calculated: ${newAvailable})`
        );
      }

      return tx.inventoryBalance.update({
        where: { skuId },
        data: {
          onHand: newOnHand,
          reserved: newReserved,
          available: newAvailable,
        },
      });
    });
  }
}
