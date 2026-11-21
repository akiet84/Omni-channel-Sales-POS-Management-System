import Fastify from 'fastify';
import dotenv from 'dotenv';
import { InventoryService } from './services/inventory.service.js';
import { prisma } from './db.js';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.get('/healthz', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get('/api/channels', async () => {
  return prisma.salesChannel.findMany({
    where: { isActive: true },
  });
});

fastify.get('/api/skus', async (request) => {
  const { query } = request.query as { query?: string };
  return InventoryService.listSkus(query);
});

fastify.get('/api/skus/search', async (request, reply) => {
  const { code } = request.query as { code?: string };
  if (!code) {
    return reply.status(400).send({ error: 'Parameter "code" is required' });
  }
  const sku = await InventoryService.findByBarcodeOrCode(code);
  if (!sku) {
    return reply.status(404).send({ error: 'SKU not found' });
  }
  return sku;
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { fastify };
