import type { FastifyInstance } from 'fastify';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import archiver from 'archiver';
import { createJob, getJob } from './jobs.js';
import type { BrandConfig } from '../types.js';

function parseColors(colorsStr?: string): string[] {
  if (!colorsStr) return [];
  return colorsStr.split(',').map((c) => c.trim()).filter(Boolean);
}

function parseStyles(stylesStr?: string): string[] {
  if (!stylesStr) return ['minimal', 'neon', 'clay', 'blueprint'];
  return stylesStr.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function registerRoutes(fastify: FastifyInstance) {
  // CORS
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
  });

  fastify.options('*', async (request, reply) => {
    return reply.code(204).send();
  });

  // POST /api/jobs - Create a new job
  fastify.post('/api/jobs', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      // Handle different @fastify/multipart field formats
      const configField = data.fields?.config;
      let configStr: string | undefined;

      if (Array.isArray(configField)) {
        // Field is an array (multiple values)
        configStr = (configField[0] as any)?.value;
      } else if (configField && typeof configField === 'object') {
        // Field is a single object
        configStr = (configField as any).value;
      }

      if (!configStr) {
        fastify.log.error({ fields: data.fields }, 'No config found in fields');
        return reply.code(400).send({ error: 'No config provided' });
      }

      const configData = JSON.parse(configStr);
      const logoBuffer = await data.toBuffer();

      const config: BrandConfig = {
        logoPath: '', // Set in createJob
        name: configData.name,
        tagline: configData.tagline,
        colors: parseColors(configData.colors),
        styles: parseStyles(configData.styles),
        preset: configData.preset,
        customStyles: configData.customStyles || undefined,
        n: parseInt(configData.n || '2', 10),
        outputDir: '', // Set in createJob
        format: configData.format || 'png',
        quality: configData.quality || 'high',
        dryRun: false,
        cache: configData.cache !== false,
        apiKey: configData.apiKey, // API key from frontend
        demoMode: configData.demoMode || false, // Demo mode
        backgroundSize: configData.backgroundSize || 'landscape', // Image size
        transparency: configData.transparency || false, // PNG transparency
        compression: configData.compression || 85, // JPEG compression
      };

      const jobId = await createJob(logoBuffer, config);
      return reply.send({ jobId });
    } catch (error) {
      fastify.log.error(error);
      return reply
        .code(500)
        .send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
  });

  // GET /api/jobs/:id/events - SSE for progress and cost updates
  fastify.get<{ Params: { id: string } }>(
    '/api/jobs/:id/events',
    async (request, reply) => {
      const { id } = request.params;
      const job = getJob(id);

      if (!job) {
        return reply.code(404).send({ error: 'Job not found' });
      }

      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.writeHead(200);

      let lastIndex = 0;
      let lastCost = 0;
      const interval = setInterval(() => {
        // Send cost updates
        if (job.cost.totalCost !== lastCost) {
          reply.raw.write(`data: ${JSON.stringify({ cost: job.cost })}\n\n`);
          lastCost = job.cost.totalCost;
        }

        // Send progress messages
        if (job.progress.length > lastIndex) {
          const newMessages = job.progress.slice(lastIndex);
          for (const message of newMessages) {
            reply.raw.write(`data: ${JSON.stringify({ message })}\n\n`);
          }
          lastIndex = job.progress.length;

          if (job.status === 'completed' || job.status === 'error') {
            // Send final cost
            reply.raw.write(`data: ${JSON.stringify({ cost: job.cost })}\n\n`);
            reply.raw.write(`data: ${JSON.stringify({ status: job.status })}\n\n`);
            clearInterval(interval);
            reply.raw.end();
          }
        }
      }, 500);

      request.raw.on('close', () => {
        clearInterval(interval);
        reply.raw.end();
      });
    }
  );

  // GET /api/jobs/:id/result - Job result
  fastify.get<{ Params: { id: string } }>(
    '/api/jobs/:id/result',
    async (request, reply) => {
      const { id } = request.params;
      const job = getJob(id);

      if (!job) {
        return reply.code(404).send({ error: 'Job not found' });
      }

      if (job.status !== 'completed') {
        return reply.code(400).send({
          error: 'Job not completed yet',
          status: job.status,
        });
      }

      const port = request.socket.localPort || 3001;
      const baseUrl = `${request.protocol}://${request.hostname}:${port}`;
      const files = (job.files || []).map((file) => {
        const relativePath = file.replace(job.outputDir || '', '').replace(/^\/+/, '');
        return {
          path: relativePath,
          url: `${baseUrl}/api/jobs/${id}/files/${relativePath}`,
        };
      });

      let manifest = null;
      if (job.manifestPath && existsSync(job.manifestPath)) {
        const fs = await import('fs/promises');
        const manifestContent = await fs.readFile(job.manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
      }

      return reply.send({
        manifest,
        files,
        outputDir: job.outputDir,
      });
    }
  );

  // GET /api/jobs/:id/files/* - File serving
  fastify.get<{ Params: { id: string; '*': string } }>(
    '/api/jobs/:id/files/*',
    async (request, reply) => {
      const { id, '*': filePath } = request.params;
      const job = getJob(id);

      if (!job || !job.outputDir) {
        return reply.code(404).send({ error: 'Job not found' });
      }

      const fullPath = join(job.outputDir, filePath);
      if (!existsSync(fullPath)) {
        return reply.code(404).send({ error: 'File not found' });
      }

      return reply.send(createReadStream(fullPath));
    }
  );

  // GET /api/jobs/:id/download - ZIP download
  fastify.get<{ Params: { id: string } }>(
    '/api/jobs/:id/download',
    async (request, reply) => {
      const { id } = request.params;
      const job = getJob(id);

      if (!job || !job.outputDir) {
        return reply.code(404).send({ error: 'Job not found' });
      }

      if (job.status !== 'completed') {
        return reply.code(400).send({
          error: 'Job not completed yet',
          status: job.status,
        });
      }

      reply.raw.setHeader('Content-Type', 'application/zip');
      reply.raw.setHeader(
        'Content-Disposition',
        `attachment; filename="brandkit-${id}.zip"`
      );
      reply.raw.writeHead(200);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(reply.raw);
      archive.directory(job.outputDir, false);
      await archive.finalize();
    }
  );
}
