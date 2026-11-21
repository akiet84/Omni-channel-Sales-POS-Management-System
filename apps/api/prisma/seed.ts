import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial omni-channel sales & inventory data...');

  // 1. Create Default Sales Channels
  const posChannel = await prisma.salesChannel.upsert({
    where: { id: 'channel-pos-main' },
    update: {},
    create: {
      id: 'channel-pos-main',
      name: 'Cửa hàng chính (POS Quầy)',
      type: 'POS',
      isActive: true,
    },
  });

  await prisma.salesChannel.upsert({
    where: { id: 'channel-shopee' },
    update: {},
    create: {
      id: 'channel-shopee',
      name: 'Gian hàng Shopee Mall',
      type: 'SHOPEE',
      isActive: true,
    },
  });

  await prisma.salesChannel.upsert({
    where: { id: 'channel-tiktok' },
    update: {},
    create: {
      id: 'channel-tiktok',
      name: 'TikTok Shop Official',
      type: 'TIKTOK_SHOP',
      isActive: true,
    },
  });

  // 2. Create Default Customer
  await prisma.customer.upsert({
    where: { phone: '0901234567' },
    update: {},
    create: {
      phone: '0901234567',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@example.com',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    },
  });

  // 3. Products & SKUs with split inventory
  const sampleProducts = [
    {
      name: 'Áo Thun Cotton Compact 100%',
      category: 'Thời trang nam',
      basePrice: 199000,
      skus: [
        {
          skuCode: 'AT-COT-TRANG-M',
          barcode: '893600100101',
          name: 'Áo Thun Cotton - Trắng / M',
          attrs: { color: 'Trắng', size: 'M' },
          price: 199000,
          costPrice: 90000,
          onHand: 50,
          reserved: 5,
        },
        {
          skuCode: 'AT-COT-TRANG-L',
          barcode: '893600100102',
          name: 'Áo Thun Cotton - Trắng / L',
          attrs: { color: 'Trắng', size: 'L' },
          price: 199000,
          costPrice: 90000,
          onHand: 40,
          reserved: 0,
        },
        {
          skuCode: 'AT-COT-DEN-L',
          barcode: '893600100103',
          name: 'Áo Thun Cotton - Đen / L',
          attrs: { color: 'Đen', size: 'L' },
          price: 199000,
          costPrice: 90000,
          onHand: 35,
          reserved: 2,
        },
      ],
    },
    {
      name: 'Quần Jean Slimfit Co Giãn',
      category: 'Thời trang nam',
      basePrice: 450000,
      skus: [
        {
          skuCode: 'QJ-SLIM-XANH-30',
          barcode: '893600200201',
          name: 'Quần Jean Slimfit - Xanh Đậm / Size 30',
          attrs: { color: 'Xanh Đậm', size: '30' },
          price: 450000,
          costPrice: 220000,
          onHand: 25,
          reserved: 3,
        },
        {
          skuCode: 'QJ-SLIM-XANH-32',
          barcode: '893600200202',
          name: 'Quần Jean Slimfit - Xanh Đậm / Size 32',
          attrs: { color: 'Xanh Đậm', size: '32' },
          price: 450000,
          costPrice: 220000,
          onHand: 30,
          reserved: 0,
        },
      ],
    },
    {
      name: 'Giày Sneaker Thể Thao Classic',
      category: 'Giày dép',
      basePrice: 650000,
      skus: [
        {
          skuCode: 'SNK-CLS-TRANG-41',
          barcode: '893600300301',
          name: 'Giày Sneaker Classic - Trắng / 41',
          attrs: { color: 'Trắng', size: '41' },
          price: 650000,
          costPrice: 320000,
          onHand: 15,
          reserved: 1,
        },
        {
          skuCode: 'SNK-CLS-TRANG-42',
          barcode: '893600300302',
          name: 'Giày Sneaker Classic - Trắng / 42',
          attrs: { color: 'Trắng', size: '42' },
          price: 650000,
          costPrice: 320000,
          onHand: 20,
          reserved: 4,
        },
      ],
    },
    {
      name: 'Balo Laptop Chống Nước 15.6 inch',
      category: 'Phụ kiện',
      basePrice: 390000,
      skus: [
        {
          skuCode: 'BALO-WP-XAM',
          barcode: '893600400401',
          name: 'Balo Laptop Chống Nước - Xám Khói',
          attrs: { color: 'Xám Khói' },
          price: 390000,
          costPrice: 180000,
          onHand: 60,
          reserved: 10,
        },
        {
          skuCode: 'BALO-WP-DEN',
          barcode: '893600400402',
          name: 'Balo Laptop Chống Nước - Đen Nhám',
          attrs: { color: 'Đen Nhám' },
          price: 390000,
          costPrice: 180000,
          onHand: 45,
          reserved: 5,
        },
      ],
    },
    {
      name: 'Ví Da Nam Cầm Tay Cao Cấp',
      category: 'Phụ kiện',
      basePrice: 290000,
      skus: [
        {
          skuCode: 'VI-DA-NAU',
          barcode: '893600500501',
          name: 'Ví Da Nam Cầm Tay - Nâu Da Bò',
          attrs: { color: 'Nâu Da Bò' },
          price: 290000,
          costPrice: 120000,
          onHand: 30,
          reserved: 0,
        },
      ],
    },
  ];

  for (const prodData of sampleProducts) {
    const product = await prisma.product.create({
      data: {
        name: prodData.name,
        category: prodData.category,
        basePrice: prodData.basePrice,
      },
    });

    for (const skuData of prodData.skus) {
      await prisma.sKU.create({
        data: {
          productId: product.id,
          skuCode: skuData.skuCode,
          barcode: skuData.barcode,
          name: skuData.name,
          variantAttributes: JSON.stringify(skuData.attrs),
          price: skuData.price,
          costPrice: skuData.costPrice,
          inventory: {
            create: {
              onHand: skuData.onHand,
              reserved: skuData.reserved,
              available: skuData.onHand - skuData.reserved,
            },
          },
        },
      });
    }
  }

  const count = await prisma.sKU.count();
  console.log(`Seeding complete! Total active SKUs in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
