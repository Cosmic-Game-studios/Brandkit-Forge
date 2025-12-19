import { join } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';
import type { BrandConfig, BrandkitManifest, CostInfo } from '../types.js';
import { exportIcons, exportSocial } from './exportSizes.js';
import { generateGallery } from './gallery.js';

export type DemoProgressCallback = (message: string) => void;
export type DemoCostCallback = (cost: CostInfo) => void;

// Style-based gradient colors
const STYLE_GRADIENTS: Record<string, { from: string; to: string }> = {
  minimal: { from: '#f8fafc', to: '#e2e8f0' },
  neon: { from: '#0f172a', to: '#7c3aed' },
  clay: { from: '#fef3c7', to: '#fcd34d' },
  blueprint: { from: '#1e3a5f', to: '#3b82f6' },
};

// Default gradient for custom styles
const DEFAULT_GRADIENT = { from: '#6366f1', to: '#8b5cf6' };

async function createGradientImage(
  width: number,
  height: number,
  fromColor: string,
  toColor: string,
  outputPath: string
): Promise<void> {
  // Create SVG gradient
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${fromColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${toColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="24" font-family="Arial">
        DEMO
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

async function createHeroImage(
  logoPath: string,
  backgroundPath: string,
  width: number,
  height: number,
  outputPath: string
): Promise<void> {
  // Read background
  const background = sharp(backgroundPath).resize(width, height);

  // Read and resize logo
  const logoSize = Math.min(width, height) * 0.4;
  const logo = await sharp(logoPath)
    .resize(Math.round(logoSize), Math.round(logoSize), { fit: 'inside' })
    .toBuffer();

  const logoMetadata = await sharp(logo).metadata();
  const logoWidth = logoMetadata.width || logoSize;
  const logoHeight = logoMetadata.height || logoSize;

  // Composite logo in center
  await background
    .composite([
      {
        input: logo,
        left: Math.round((width - logoWidth) / 2),
        top: Math.round((height - logoHeight) / 2),
      },
    ])
    .png()
    .toFile(outputPath);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateDemoKit(
  config: BrandConfig,
  outputDir: string,
  onProgress?: DemoProgressCallback,
  onCost?: DemoCostCallback
): Promise<{ manifest: BrandkitManifest; files: string[] }> {
  const progress = onProgress || (() => {});
  const reportCost = onCost || (() => {});

  const costInfo: CostInfo = {
    totalCost: 0,
    apiCalls: 0,
    breakdown: { backgrounds: 0, heroes: 0 },
  };

  progress('Demo mode: Generating placeholder assets...');
  progress(`Brand: ${config.name}`);
  if (config.tagline) {
    progress(`Tagline: ${config.tagline}`);
  }
  progress(`Styles: ${config.styles.join(', ')}`);
  progress(`Variants per style: ${config.n}`);

  const manifest: BrandkitManifest = {
    timestamp: new Date().toISOString(),
    input: {
      logo: config.logoPath,
      name: config.name,
      tagline: config.tagline,
      colors: config.colors,
    },
    config: {
      styles: config.styles,
      preset: config.preset,
      n: config.n,
      format: config.format,
      quality: config.quality,
    },
    prompts: {
      backgrounds: {},
      edits: {},
    },
    generated: {
      backgrounds: [],
      heroes: [],
      icons: [],
      social: [],
    },
    outputDir,
  };

  // Generate backgrounds and heroes for each style
  progress('\nStep 1: Generating demo backgrounds...');

  for (const style of config.styles) {
    const gradient = STYLE_GRADIENTS[style] || DEFAULT_GRADIENT;

    for (let i = 0; i < config.n; i++) {
      const variantDir = join(outputDir, 'variants', style, `${i}`);
      await mkdir(variantDir, { recursive: true });

      // Generate background
      const backgroundPath = join(variantDir, 'background.png');
      await createGradientImage(1536, 1024, gradient.from, gradient.to, backgroundPath);
      manifest.generated.backgrounds.push(backgroundPath);
      manifest.prompts.backgrounds[`${style}-${i}`] = `[DEMO] ${style} style gradient background`;

      // Simulate API cost
      costInfo.apiCalls++;
      costInfo.breakdown.backgrounds += 0.00;
      costInfo.totalCost = costInfo.breakdown.backgrounds + costInfo.breakdown.heroes;
      reportCost({ ...costInfo });

      progress(`  Generated: ${style} background variant ${i + 1}`);
      await delay(300); // Simulate processing time
    }
  }

  progress('\nStep 2: Composing demo heroes...');

  for (const style of config.styles) {
    for (let i = 0; i < config.n; i++) {
      const variantDir = join(outputDir, 'variants', style, `${i}`);
      const backgroundPath = join(variantDir, 'background.png');

      // Hero landscape (1536x1024)
      const heroLandscapePath = join(variantDir, 'hero-landscape.png');
      await createHeroImage(config.logoPath, backgroundPath, 1536, 1024, heroLandscapePath);
      manifest.generated.heroes.push(heroLandscapePath);
      manifest.prompts.edits[`${style}-${i}-landscape`] = `[DEMO] Logo composited on ${style} background`;

      costInfo.apiCalls++;
      costInfo.breakdown.heroes += 0.00;
      costInfo.totalCost = costInfo.breakdown.backgrounds + costInfo.breakdown.heroes;
      reportCost({ ...costInfo });

      progress(`  Composed: ${style} hero landscape variant ${i + 1}`);
      await delay(200);

      // Hero square (1024x1024)
      const heroSquarePath = join(variantDir, 'hero-square.png');
      await createHeroImage(config.logoPath, backgroundPath, 1024, 1024, heroSquarePath);
      manifest.generated.heroes.push(heroSquarePath);
      manifest.prompts.edits[`${style}-${i}-square`] = `[DEMO] Logo composited on ${style} background (square)`;

      costInfo.apiCalls++;
      costInfo.breakdown.heroes += 0.00;
      costInfo.totalCost = costInfo.breakdown.backgrounds + costInfo.breakdown.heroes;
      reportCost({ ...costInfo });

      progress(`  Composed: ${style} hero square variant ${i + 1}`);
      await delay(200);
    }
  }

  progress('\nStep 3: Exporting icons and social media assets...');

  // Export icons from logo
  await exportIcons(config.logoPath, outputDir, config.format, manifest);
  progress('  Exported icon pack (16px - 1024px)');

  // Export social images from first hero
  const firstHero = manifest.generated.heroes[0];
  if (firstHero) {
    await exportSocial(firstHero, outputDir, config.format, manifest);
    progress('  Exported social media images (OG, Twitter/X)');
  }

  progress('\nStep 4: Generating gallery...');
  const galleryDir = join(outputDir, 'gallery');
  await mkdir(galleryDir, { recursive: true });
  generateGallery(outputDir, manifest);
  progress('  Generated HTML gallery');

  progress('\nDemo generation complete!');
  progress(`Total demo images: ${costInfo.apiCalls} (no API cost)`);

  const files = [
    ...manifest.generated.backgrounds,
    ...manifest.generated.heroes,
    ...manifest.generated.icons,
    ...manifest.generated.social,
  ];

  return { manifest, files };
}
