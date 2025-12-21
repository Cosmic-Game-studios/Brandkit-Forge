import { join } from 'path';
import pLimit from 'p-limit';
import type { BrandConfig, BrandkitManifest } from '../types.js';
import { buildEditPrompt } from '../lib/prompts.js';
import { composeHero } from '../lib/openai.js';
import { hashConfig, getCachedPath, setCachedPath } from '../lib/cache.js';
import { getHeroSizes } from '../lib/imageSizes.js';
import type { CostCallback } from './types.js';

function buildEditKey(style: string, variant: number, sizeType: string): string {
  return `${style}-${variant}-${sizeType}`;
}

function recordEditPrompt(
  manifest: BrandkitManifest,
  editKey: string,
  prompt: string
): void {
  manifest.prompts.edits[editKey] = prompt;
}

export async function composeHeroes(
  config: BrandConfig,
  outputDir: string,
  backgrounds: Map<string, string[]>,
  manifest: BrandkitManifest,
  onCost?: CostCallback
): Promise<void> {
  const limit = pLimit(2);
  const tasks: Array<Promise<string>> = [];
  const editPrompt = buildEditPrompt(config);
  const heroSizes = getHeroSizes(config);

  for (const [style, bgPaths] of backgrounds.entries()) {
    for (let i = 0; i < bgPaths.length; i++) {
      const backgroundPath = bgPaths[i];
      for (const { type: sizeType, size, filename } of heroSizes) {
        const outputPath = join(outputDir, 'variants', style, `${i}`, filename);
        const editKey = buildEditKey(style, i, sizeType);
        const hash = hashConfig(config, `${editKey}-${editPrompt}`);
        const cachedPath = getCachedPath(hash, config);

        if (cachedPath) {
          manifest.generated.heroes.push(cachedPath);
          recordEditPrompt(manifest, editKey, editPrompt);
          continue;
        }

        if (config.dryRun) {
          console.log(`  [DRY-RUN] Would compose: ${editKey}`);
          console.log(`    Prompt: ${editPrompt}`);
          recordEditPrompt(manifest, editKey, editPrompt);
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
          recordEditPrompt(manifest, editKey, editPrompt);
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
