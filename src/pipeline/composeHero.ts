import { join } from 'path';
import pLimit from 'p-limit';
import type { BrandConfig, BrandkitManifest } from '../types.js';
import { buildEditPrompt } from '../lib/prompts.js';
import { composeHero } from '../lib/openai.js';
import { hashConfig, getCachedPath, setCachedPath } from '../lib/cache.js';
import type { CostCallback } from './generateBackgrounds.js';

function getHeroSizes(config: BrandConfig): Array<{ type: string; size: '1536x1024' | '1024x1024' | '1024x1536'; filename: string }> {
  const bgSize = config.backgroundSize || 'landscape';
  const sizes: Array<{ type: string; size: '1536x1024' | '1024x1024' | '1024x1536'; filename: string }> = [];

  // Use .png as base - convertToFormat will change extension if needed
  // Always include a square version
  sizes.push({ type: 'square', size: '1024x1024', filename: 'hero-square.png' });

  // Add the primary size based on config
  if (bgSize === 'portrait') {
    sizes.push({ type: 'portrait', size: '1024x1536', filename: 'hero-portrait.png' });
  } else if (bgSize === 'landscape') {
    sizes.push({ type: 'landscape', size: '1536x1024', filename: 'hero-landscape.png' });
  }
  // If square, we only generate the square version (already added above)

  return sizes;
}

export async function composeHeroes(
  config: BrandConfig,
  outputDir: string,
  backgrounds: Map<string, string[]>,
  manifest: BrandkitManifest,
  onCost?: CostCallback
): Promise<void> {
  const limit = pLimit(2);
  const tasks = [];
  const editPrompt = buildEditPrompt(config);
  const heroSizes = getHeroSizes(config);

  for (const [style, bgPaths] of backgrounds.entries()) {
    for (let i = 0; i < bgPaths.length; i++) {
      const backgroundPath = bgPaths[i];
      for (const { type: sizeType, size, filename } of heroSizes) {
        const outputPath = join(outputDir, 'variants', style, `${i}`, filename);

        const hash = hashConfig(config, `${style}-${i}-${sizeType}-${editPrompt}`);
        const cachedPath = getCachedPath(hash, config);

        if (cachedPath) {
          manifest.generated.heroes.push(cachedPath);
          manifest.prompts.edits[`${style}-${i}-${sizeType}`] = editPrompt;
          continue;
        }

        if (config.dryRun) {
          console.log(`  [DRY-RUN] Would compose: ${style}-${i}-${sizeType}`);
          console.log(`    Prompt: ${editPrompt}`);
          manifest.prompts.edits[`${style}-${i}-${sizeType}`] = editPrompt;
          continue;
        }

        const task = limit(async () => {
          const result = await composeHero(
            config.logoPath,
            backgroundPath,
            editPrompt,
            outputPath,
            size,
            config
          );
          setCachedPath(hash, result.path, config);
          manifest.generated.heroes.push(result.path);
          manifest.prompts.edits[`${style}-${i}-${sizeType}`] = editPrompt;
          // Report cost
          if (onCost) {
            onCost(result.cost.cost, 'heroes');
          }
          return result.path;
        });

        tasks.push(task);
      }
    }
  }

  if (!config.dryRun) {
    await Promise.all(tasks);
  }
}
