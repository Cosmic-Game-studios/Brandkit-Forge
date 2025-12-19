import { existsSync } from 'fs';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import type { BrandConfig, BrandkitManifest, CostInfo } from '../types.js';
import { generateBackgrounds } from '../pipeline/generateBackgrounds.js';
import { composeHeroes } from '../pipeline/composeHero.js';
import { exportIcons, exportSocial } from '../pipeline/exportSizes.js';
import { generateGallery } from '../pipeline/gallery.js';
import { generateDemoKit } from '../pipeline/demoGenerator.js';

export interface ForgeOptions {
  onProgress?: (message: string) => void;
  onCost?: (cost: CostInfo) => void;
}

export interface ForgeResult {
  outDir: string;
  manifestPath: string;
  files: string[];
  cost: CostInfo;
}

export async function forgeBrandKit(
  config: BrandConfig,
  opts?: ForgeOptions
): Promise<ForgeResult> {
  const onProgress = opts?.onProgress || (() => {});
  const onCost = opts?.onCost || (() => {});

  if (!existsSync(config.logoPath)) {
    throw new Error(`Logo file not found: ${config.logoPath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = join(config.outputDir, timestamp);
  await mkdir(outputDir, { recursive: true });

  // Demo mode: just generate prompts for manual use
  if (config.demoMode) {
    const demoCost: CostInfo = {
      totalCost: 0,
      apiCalls: 0,
      breakdown: { backgrounds: 0, heroes: 0 },
    };

    await generateDemoKit(
      { ...config, outputDir },
      outputDir,
      onProgress,
      onCost
    );

    return {
      outDir: outputDir,
      manifestPath: '',
      files: [],
      cost: demoCost,
    };
  }

  // Initialize cost tracking
  const costInfo: CostInfo = {
    totalCost: 0,
    apiCalls: 0,
    breakdown: {
      backgrounds: 0,
      heroes: 0,
    },
  };

  const addCost = (amount: number, type: 'backgrounds' | 'heroes') => {
    costInfo.totalCost += amount;
    costInfo.apiCalls += 1;
    costInfo.breakdown[type] += amount;
    onCost({ ...costInfo });
  };

  onProgress('Brandkit Forge started');
  onProgress(`Brand: ${config.name}`);
  if (config.tagline) {
    onProgress(`Tagline: ${config.tagline}`);
  }
  onProgress(`Styles: ${config.styles.join(', ')}`);
  if (config.preset) {
    onProgress(`Preset: ${config.preset}`);
  }
  onProgress(`Variants per style: ${config.n}`);
  onProgress(`Output: ${outputDir}`);

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

  onProgress('\nStep 1: Generate backgrounds...');
  const backgrounds = await generateBackgrounds(config, outputDir, manifest, addCost);

  onProgress('\nStep 2: Compose heroes...');
  await composeHeroes(config, outputDir, backgrounds, manifest, addCost);

  onProgress('\nStep 3: Export icons and social media assets...');
  const firstHero = manifest.generated.heroes[0];
  if (firstHero) {
    await exportSocial(firstHero, outputDir, config, manifest);
  }
  await exportIcons(config.logoPath, outputDir, config, manifest);

  onProgress('\nStep 4: Generate gallery...');
  generateGallery(outputDir, manifest);

  onProgress('\nStep 5: Write manifest...');
  const manifestPath = join(outputDir, 'brandkit.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  onProgress(`Manifest saved: ${manifestPath}`);

  // Collect all generated files.
  const files: string[] = [
    ...manifest.generated.backgrounds,
    ...manifest.generated.heroes,
    ...manifest.generated.icons,
    ...manifest.generated.social,
    manifestPath,
    join(outputDir, 'gallery', 'index.html'),
  ];

  onProgress('\nDone!');
  onProgress(`Total API cost: $${costInfo.totalCost.toFixed(4)}`);

  return {
    outDir: outputDir,
    manifestPath,
    files,
    cost: costInfo,
  };
}
