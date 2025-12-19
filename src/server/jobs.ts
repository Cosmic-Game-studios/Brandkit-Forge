import { randomUUID } from 'crypto';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import type { BrandConfig, CostInfo } from '../types.js';
import { forgeBrandKit } from '../core/forge.js';

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  config: BrandConfig;
  logoPath: string;
  outputDir?: string;
  manifestPath?: string;
  files?: string[];
  error?: string;
  progress: string[];
  cost: CostInfo;
}

const jobs = new Map<string, Job>();
const JOB_TEMP_DIR = join(process.cwd(), '.temp', 'jobs');

export async function createJob(
  logoBuffer: Buffer,
  config: BrandConfig
): Promise<string> {
  const jobId = randomUUID();
  const jobDir = join(JOB_TEMP_DIR, jobId);
  await mkdir(jobDir, { recursive: true });

  const logoPath = join(jobDir, 'logo.png');
  await writeFile(logoPath, logoBuffer);

  const job: Job = {
    id: jobId,
    status: 'pending',
    config: {
      ...config,
      logoPath,
      outputDir: join(jobDir, 'output'),
    },
    logoPath,
    progress: [],
    cost: {
      totalCost: 0,
      apiCalls: 0,
      breakdown: {
        backgrounds: 0,
        heroes: 0,
      },
    },
  };

  jobs.set(jobId, job);

  // Start the job asynchronously.
  processJob(jobId).catch((error) => {
    const job = jobs.get(jobId);
    if (job) {
      job.status = 'error';
      job.error = error instanceof Error ? error.message : String(error);
      job.progress.push(`Error: ${job.error}`);
    }
  });

  return jobId;
}

async function processJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  job.status = 'processing';
  job.progress.push('Job started...');

  try {
    const result = await forgeBrandKit(job.config, {
      onProgress: (message) => {
        job.progress.push(message);
      },
      onCost: (costInfo) => {
        job.cost = { ...costInfo };
      },
    });

    job.status = 'completed';
    job.outputDir = result.outDir;
    job.manifestPath = result.manifestPath;
    job.files = result.files;
    job.cost = result.cost;
    job.progress.push('Job completed!');
  } catch (error) {
    job.status = 'error';
    job.error = error instanceof Error ? error.message : String(error);
    job.progress.push(`Error: ${job.error}`);
    throw error;
  }
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values());
}

export async function cleanupJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (job) {
    const jobDir = join(JOB_TEMP_DIR, jobId);
    if (existsSync(jobDir)) {
      await rm(jobDir, { recursive: true, force: true });
    }
    jobs.delete(jobId);
  }
}
