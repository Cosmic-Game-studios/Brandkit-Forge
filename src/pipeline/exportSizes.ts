import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import type { BrandConfig, BrandkitManifest } from '../types.js';
import pLimit from 'p-limit';
import {
  applyOutputFormat,
  getOutputExtension,
  getOutputFormat,
  getOutputQuality,
} from '../lib/imageFormat.js';

const ICON_SIZES = [
  { name: 'app-icon-1024', size: 1024 },
  { name: 'app-icon-512', size: 512 },
  { name: 'app-icon-256', size: 256 },
  { name: 'app-icon-192', size: 192 },
  { name: 'app-icon-180', size: 180 },
  { name: 'app-icon-152', size: 152 },
  { name: 'app-icon-128', size: 128 },
  { name: 'favicon-32', size: 32 },
  { name: 'favicon-16', size: 16 },
];

export async function exportIcons(
  logoPath: string,
  outputDir: string,
  config: BrandConfig,
  manifest: BrandkitManifest
): Promise<void> {
  const iconsDir = join(outputDir, 'icons');
  await mkdir(iconsDir, { recursive: true });

  const logoBuffer = readFileSync(logoPath);
  const limit = pLimit(5);
  const format = getOutputFormat(config);
  const quality = getOutputQuality(config);
  const extension = getOutputExtension(format);

  const tasks = ICON_SIZES.map(({ name, size }) =>
    limit(async () => {
      const outputPath = join(iconsDir, `${name}.${extension}`);

      let sharpInstance = sharp(logoBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        });

      sharpInstance = applyOutputFormat(sharpInstance, format, quality);
      await sharpInstance.toFile(outputPath);

      manifest.generated.icons.push(outputPath);
      console.log(`  Exported: ${name}.${extension}`);
    })
  );

  await Promise.all(tasks);
}

export async function exportSocial(
  heroPath: string,
  outputDir: string,
  config: BrandConfig,
  manifest: BrandkitManifest
): Promise<void> {
  const socialDir = join(outputDir, 'social');
  await mkdir(socialDir, { recursive: true });

  const heroBuffer = readFileSync(heroPath);
  const format = getOutputFormat(config);
  const quality = getOutputQuality(config);
  const extension = getOutputExtension(format);

  const ogPath = join(socialDir, `og-1200x630.${extension}`);
  let ogSharp = sharp(heroBuffer).resize(1200, 630, {
    fit: 'cover',
    position: 'center',
  });
  ogSharp = applyOutputFormat(ogSharp, format, quality);
  await ogSharp.toFile(ogPath);
  manifest.generated.social.push(ogPath);
  console.log(`  Exported: og-1200x630.${extension}`);

  const xPath = join(socialDir, `x-1600x900.${extension}`);
  let xSharp = sharp(heroBuffer).resize(1600, 900, {
    fit: 'cover',
    position: 'center',
  });
  xSharp = applyOutputFormat(xSharp, format, quality);
  await xSharp.toFile(xPath);
  manifest.generated.social.push(xPath);
  console.log(`  Exported: x-1600x900.${extension}`);
}
