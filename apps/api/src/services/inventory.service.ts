import { prisma } from '../db.js';

export class InventoryService {
  /**
   * Retrieves an SKU along with its split inventory balance (On-hand, Reserved, Available)
   */
  static async getSkuWithInventory(skuId: string) {
    return prisma.sKU.findUnique({
      where: { id: skuId },
      include: {
        inventory: true,
        product: true,
      },
    });
  }

  /**
   * Finds SKU by barcode or SKU code
   */
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

  /**
   * Lists SKUs with inventory balance, with optional keyword search
   */
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

  /**
   * Adjusts inventory according to ADR 0004
   * Available is always maintained as onHand - reserved
   */
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
        throw new Error(`Insufficient on-hand stock for SKU: ${skuId}`);
      }
      if (newAvailable < 0) {
        throw new Error(`Insufficient available stock for SKU: ${skuId}`);
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
