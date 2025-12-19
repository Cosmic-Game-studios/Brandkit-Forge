import { join } from 'path';
import pLimit from 'p-limit';
import type { BrandConfig, BrandkitManifest } from '../types.js';
import { buildEditPrompt } from '../lib/prompts.js';
import { composeHero } from '../lib/openai.js';
import { hashConfig, getCachedPath, setCachedPath } from '../lib/cache.js';
import type { CostCallback } from './generateBackgrounds.js';

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

  for (const [style, bgPaths] of backgrounds.entries()) {
    for (let i = 0; i < bgPaths.length; i++) {
      const backgroundPath = bgPaths[i];
      for (const sizeType of ['landscape', 'square'] as const) {
        const size = sizeType === 'landscape' ? '1536x1024' : '1024x1024';
        const filename = sizeType === 'landscape' ? 'hero-landscape.png' : 'hero-square.png';
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
            size as '1536x1024' | '1024x1024',
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
