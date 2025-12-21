import type { FastifyInstance } from 'fastify';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import archiver from 'archiver';
import { createJob, getJob } from './jobs.js';
import type { BrandConfig } from '../types.js';
import { normalizeConfig } from '../lib/config.js';
import { FileUploadError, ValidationError, NotFoundError, isAppError, getErrorMessage } from '../lib/errors.js';

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

  /**
   * POST /api/jobs - Create a new job
   * 
   * @route POST /api/jobs
   * @description Creates a new brandkit generation job
   * @body multipart/form-data with 'file' (logo) and 'config' (JSON string)
   * @returns { jobId: string }
   */
  fastify.post('/api/jobs', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        throw new FileUploadError('No file uploaded');
      }

      // Type-safe extraction of config field
      const configField = data.fields?.config;
      let configStr: string | undefined;

      if (Array.isArray(configField)) {
        const firstField = configField[0];
        if (firstField && 'value' in firstField && typeof firstField.value === 'string') {
          configStr = firstField.value;
        }
      } else if (configField && typeof configField === 'object' && 'value' in configField) {
        if (typeof configField.value === 'string') {
          configStr = configField.value;
        }
      }

      if (!configStr) {
        fastify.log.error({ fields: data.fields }, 'No config found in fields');
        throw new ValidationError('No config provided', 'config');
      }

      let configData: unknown;
      try {
        configData = JSON.parse(configStr) as Record<string, unknown>;
      } catch (parseError) {
        throw new ValidationError('Invalid JSON in config field', 'config');
      }

      if (!configData || typeof configData !== 'object' || Array.isArray(configData)) {
        throw new ValidationError('Config must be an object', 'config');
      }

      // Type-safe config data extraction
      const configObj = configData as Record<string, unknown>;

      let logoBuffer: Buffer;
      try {
        logoBuffer = await data.toBuffer();
      } catch (bufferError) {
        throw new FileUploadError('Failed to read uploaded file', data.filename);
      }

      if (logoBuffer.length === 0) {
        throw new FileUploadError('Uploaded file is empty', data.filename);
      }

      const normalized = normalizeConfig({
        name: configObj.name as string,
        tagline: configObj.tagline as string | undefined,
        colors: configObj.colors as string | undefined,
        styles: configObj.styles as string | undefined,
        preset: configObj.preset as string | undefined,
        customStyles: configObj.customStyles as Record<string, string> | undefined,
        customPresets: configObj.customPresets as Record<string, { description: string; background: string; edit: string }> | undefined,
        n: configObj.n as string | number | undefined,
        format: configObj.format as string | undefined,
        quality: configObj.quality as string | undefined,
        dryRun: false,
        cache: configObj.cache !== false,
        apiKey: configObj.apiKey as string | undefined,
        demoMode: configObj.demoMode as boolean | undefined,
        backgroundSize: configObj.backgroundSize as string | undefined,
        transparency: configObj.transparency as boolean | undefined,
        compression: configObj.compression as number | undefined,
      });

      const config: BrandConfig = {
        ...normalized,
        logoPath: '', // Set in createJob
        outputDir: '', // Set in createJob
      };

      const jobId = await createJob(logoBuffer, config);
      return reply.code(201).send({ jobId });
    } catch (error) {
      fastify.log.error(error);
      
      if (isAppError(error)) {
        return reply
          .code(error.statusCode)
          .send({
            error: error.message,
            code: error.code,
          });
      }

      return reply
        .code(500)
        .send({
          error: getErrorMessage(error),
          code: 'INTERNAL_ERROR',
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

  /**
   * GET /api/jobs/:id/result - Job result
   * 
   * @route GET /api/jobs/:id/result
   * @description Retrieves the result of a completed job
   * @param {string} id - Job ID
   * @returns { manifest, files, outputDir }
   */
  fastify.get<{ Params: { id: string } }>(
    '/api/jobs/:id/result',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const job = getJob(id);

        if (!job) {
          throw new NotFoundError('Job', id);
        }

        if (job.status !== 'completed') {
          return reply.code(400).send({
            error: 'Job not completed yet',
            status: job.status,
            code: 'JOB_NOT_COMPLETED',
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
      } catch (error) {
        fastify.log.error(error);
        
        if (isAppError(error)) {
          return reply
            .code(error.statusCode)
            .send({
              error: error.message,
              code: error.code,
            });
        }

        return reply
          .code(500)
          .send({
            error: getErrorMessage(error),
            code: 'INTERNAL_ERROR',
          });
      }
    }
  );

  /**
   * GET /api/jobs/:id/files/* - File serving
   * 
   * @route GET /api/jobs/:id/files/*
   * @description Serves generated files from a job
   * @param {string} id - Job ID
   * @param {string} * - File path relative to job output directory
   * @returns File stream
   */
  fastify.get<{ Params: { id: string; '*': string } }>(
    '/api/jobs/:id/files/*',
    async (request, reply) => {
      try {
        const { id, '*': filePath } = request.params;
        const job = getJob(id);

        if (!job || !job.outputDir) {
          throw new NotFoundError('Job', id);
        }

        const fullPath = join(job.outputDir, filePath);
        if (!existsSync(fullPath)) {
          throw new NotFoundError('File', filePath);
        }

        return reply.send(createReadStream(fullPath));
      } catch (error) {
        fastify.log.error(error);
        
        if (isAppError(error)) {
          return reply
            .code(error.statusCode)
            .send({
              error: error.message,
              code: error.code,
            });
        }

        return reply
          .code(500)
          .send({
            error: getErrorMessage(error),
            code: 'INTERNAL_ERROR',
          });
      }
    }
  );

  /**
   * GET /api/jobs/:id/download - ZIP download
   * 
   * @route GET /api/jobs/:id/download
   * @description Downloads all generated files as a ZIP archive
   * @param {string} id - Job ID
   * @returns ZIP file stream
   */
  fastify.get<{ Params: { id: string } }>(
    '/api/jobs/:id/download',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const job = getJob(id);

        if (!job || !job.outputDir) {
          throw new NotFoundError('Job', id);
        }

        if (job.status !== 'completed') {
          return reply.code(400).send({
            error: 'Job not completed yet',
            status: job.status,
            code: 'JOB_NOT_COMPLETED',
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
      } catch (error) {
        fastify.log.error(error);
        
        if (isAppError(error)) {
          return reply
            .code(error.statusCode)
            .send({
              error: error.message,
              code: error.code,
            });
        }

        return reply
          .code(500)
          .send({
            error: getErrorMessage(error),
            code: 'INTERNAL_ERROR',
          });
      }
    }
  );
}
