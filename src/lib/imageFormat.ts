import { dirname, parse, join } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';
import type { BrandConfig } from '../types.js';

export type OutputFormat = BrandConfig['format'];

const DEFAULT_FORMAT: OutputFormat = 'png';
const DEFAULT_QUALITY = 85;

export function getOutputFormat(config: BrandConfig): OutputFormat {
  return config.format || DEFAULT_FORMAT;
}

export function getOutputExtension(format: OutputFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

export function getOutputQuality(config: BrandConfig): number {
  return config.compression || DEFAULT_QUALITY;
}

export function resolveOutputPath(basePath: string, format: OutputFormat): string {
  const ext = getOutputExtension(format);
  const parsed = parse(basePath);
  if (!parsed.ext) {
    return `${basePath}.${ext}`;
  }
  return join(parsed.dir, `${parsed.name}.${ext}`);
}

export function applyOutputFormat(
  sharpInstance: sharp.Sharp,
  format: OutputFormat,
  quality: number
): sharp.Sharp {
  if (format === 'jpeg') {
    return sharpInstance.jpeg({ quality });
  }
  if (format === 'webp') {
    return sharpInstance.webp({ quality });
  }
  return sharpInstance.png();
}

export async function writeFormattedImage(
  buffer: Buffer,
  outputPath: string,
  config: BrandConfig
): Promise<string> {
  const format = getOutputFormat(config);
  const finalPath = resolveOutputPath(outputPath, format);
  const sharpInstance = sharp(buffer);
  const quality = getOutputQuality(config);

  await mkdir(dirname(finalPath), { recursive: true });
  await applyOutputFormat(sharpInstance, format, quality).toFile(finalPath);

  return finalPath;
}
