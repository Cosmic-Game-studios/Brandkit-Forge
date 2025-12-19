import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import type { BrandkitManifest } from '../types.js';
import pLimit from 'p-limit';

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
  format: string,
  manifest: BrandkitManifest
): Promise<void> {
  const iconsDir = join(outputDir, 'icons');
  await mkdir(iconsDir, { recursive: true });

  const logoBuffer = readFileSync(logoPath);
  const limit = pLimit(5);

  const tasks = ICON_SIZES.map(({ name, size }) =>
    limit(async () => {
      const ext = format === 'jpeg' ? 'jpg' : format;
      const outputPath = join(iconsDir, `${name}.${ext}`);

      await sharp(logoBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFormat(format as 'png' | 'webp' | 'jpeg')
        .toFile(outputPath);

      manifest.generated.icons.push(outputPath);
      console.log(`  Exported: ${name}.${ext}`);
    })
  );

  await Promise.all(tasks);
}

export async function exportSocial(
  heroPath: string,
  outputDir: string,
  format: string,
  manifest: BrandkitManifest
): Promise<void> {
  const socialDir = join(outputDir, 'social');
  await mkdir(socialDir, { recursive: true });

  const heroBuffer = readFileSync(heroPath);

  const ogExt = format === 'jpeg' ? 'jpg' : format;
  const ogPath = join(socialDir, `og-1200x630.${ogExt}`);
  await sharp(heroBuffer)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .toFormat(format as 'png' | 'webp' | 'jpeg')
    .toFile(ogPath);
  manifest.generated.social.push(ogPath);
  console.log(`  Exported: og-1200x630.${ogExt}`);

  const xExt = format === 'jpeg' ? 'jpg' : format;
  const xPath = join(socialDir, `x-1600x900.${xExt}`);
  await sharp(heroBuffer)
    .resize(1600, 900, { fit: 'cover', position: 'center' })
    .toFormat(format as 'png' | 'webp' | 'jpeg')
    .toFile(xPath);
  manifest.generated.social.push(xPath);
  console.log(`  Exported: x-1600x900.${xExt}`);
}
