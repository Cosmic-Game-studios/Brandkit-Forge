import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { registerRoutes } from './routes.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Register routes
  await registerRoutes(fastify);

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
