import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import type { BrandConfig, BrandkitManifest } from '../types.js';
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

function applyFormat(sharpInstance: sharp.Sharp, config: BrandConfig): sharp.Sharp {
  const format = config.format || 'png';
  const quality = config.compression || 85;

  if (format === 'jpeg') {
    return sharpInstance.jpeg({ quality });
  } else if (format === 'webp') {
    return sharpInstance.webp({ quality });
  }
  return sharpInstance.png();
}

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
  const format = config.format || 'png';

  const tasks = ICON_SIZES.map(({ name, size }) =>
    limit(async () => {
      const ext = format === 'jpeg' ? 'jpg' : format;
      const outputPath = join(iconsDir, `${name}.${ext}`);

      let sharpInstance = sharp(logoBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

      sharpInstance = applyFormat(sharpInstance, config);
      await sharpInstance.toFile(outputPath);

      manifest.generated.icons.push(outputPath);
      console.log(`  Exported: ${name}.${ext}`);
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
  const format = config.format || 'png';

  const ogExt = format === 'jpeg' ? 'jpg' : format;
  const ogPath = join(socialDir, `og-1200x630.${ogExt}`);
  let ogSharp = sharp(heroBuffer).resize(1200, 630, { fit: 'cover', position: 'center' });
  ogSharp = applyFormat(ogSharp, config);
  await ogSharp.toFile(ogPath);
  manifest.generated.social.push(ogPath);
  console.log(`  Exported: og-1200x630.${ogExt}`);

  const xExt = format === 'jpeg' ? 'jpg' : format;
  const xPath = join(socialDir, `x-1600x900.${xExt}`);
  let xSharp = sharp(heroBuffer).resize(1600, 900, { fit: 'cover', position: 'center' });
  xSharp = applyFormat(xSharp, config);
  await xSharp.toFile(xPath);
  manifest.generated.social.push(xPath);
  console.log(`  Exported: x-1600x900.${xExt}`);
}
