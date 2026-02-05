import { existsSync } from 'fs';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import type { BrandConfig, BrandkitManifest, CostInfo, PerformanceStats } from '../types.js';
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
  performance: PerformanceStats;
}

function trackStep(steps: PerformanceStats['steps'], name: string, startMs: number): void {
  steps.push({ name, durationMs: Date.now() - startMs });
}

export async function forgeBrandKit(
  config: BrandConfig,
  opts?: ForgeOptions
): Promise<ForgeResult> {
  const onProgress = opts?.onProgress || (() => {});
  const onCost = opts?.onCost || (() => {});
  const forgeStart = Date.now();
  const startedAt = new Date().toISOString();
  const perfSteps: PerformanceStats['steps'] = [];

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
      performance: {
        totalDurationMs: Date.now() - forgeStart,
        steps: [{ name: 'demo', durationMs: Date.now() - forgeStart }],
        startedAt,
        completedAt: new Date().toISOString(),
      },
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

  onProgress('Brandkit Forge v2.0 started');
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

  let stepStart: number;

  onProgress('\nStep 1/5: Generate backgrounds...');
  stepStart = Date.now();
  const backgrounds = await generateBackgrounds(config, outputDir, manifest, addCost);
  trackStep(perfSteps, 'backgrounds', stepStart);
  onProgress(`  Completed in ${((Date.now() - stepStart) / 1000).toFixed(1)}s`);

  onProgress('\nStep 2/5: Compose heroes...');
  stepStart = Date.now();
  await composeHeroes(config, outputDir, backgrounds, manifest, addCost);
  trackStep(perfSteps, 'heroes', stepStart);
  onProgress(`  Completed in ${((Date.now() - stepStart) / 1000).toFixed(1)}s`);

  onProgress('\nStep 3/5: Export icons and social media assets...');
  stepStart = Date.now();
  const firstHero = manifest.generated.heroes[0];
  if (firstHero) {
    await exportSocial(firstHero, outputDir, config, manifest);
  }
  await exportIcons(config.logoPath, outputDir, config, manifest);
  trackStep(perfSteps, 'exports', stepStart);
  onProgress(`  Completed in ${((Date.now() - stepStart) / 1000).toFixed(1)}s`);

  onProgress('\nStep 4/5: Generate gallery...');
  stepStart = Date.now();
  generateGallery(outputDir, manifest);
  trackStep(perfSteps, 'gallery', stepStart);

  onProgress('\nStep 5/5: Write manifest...');
  stepStart = Date.now();
  const manifestPath = join(outputDir, 'brandkit.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  trackStep(perfSteps, 'manifest', stepStart);
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

  const totalDurationMs = Date.now() - forgeStart;
  const performance: PerformanceStats = {
    totalDurationMs,
    steps: perfSteps,
    startedAt,
    completedAt: new Date().toISOString(),
  };

  onProgress('\nDone!');
  onProgress(`Total time: ${(totalDurationMs / 1000).toFixed(1)}s`);
  onProgress(`Total API cost: $${costInfo.totalCost.toFixed(4)}`);
  onProgress(`Files generated: ${files.length}`);

  return {
    outDir: outputDir,
    manifestPath,
    files,
    cost: costInfo,
    performance,
  };
}
