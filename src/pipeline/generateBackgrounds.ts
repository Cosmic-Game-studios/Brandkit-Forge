import { join } from 'path';
import pLimit from 'p-limit';
import type { BrandConfig, BrandkitManifest } from '../types.js';
import { buildBackgroundPrompt, buildCustomBackgroundPrompt } from '../lib/prompts.js';
import { generateBackground } from '../lib/openai.js';
import { hashConfig, getCachedPath, setCachedPath } from '../lib/cache.js';

export type CostCallback = (amount: number, type: 'backgrounds' | 'heroes') => void;

export async function generateBackgrounds(
  config: BrandConfig,
  outputDir: string,
  manifest: BrandkitManifest,
  onCost?: CostCallback
): Promise<Map<string, string[]>> {
  const backgrounds = new Map<string, string[]>();
  const limit = pLimit(3);
  const tasks = [];

  for (const style of config.styles) {
    const styleBackgrounds: string[] = [];

    for (let i = 0; i < config.n; i++) {
      // Check if this is a custom style
      const customPrompt = config.customStyles?.[style];
      const prompt = customPrompt
        ? buildCustomBackgroundPrompt(customPrompt, config.colors)
        : buildBackgroundPrompt(style, config.colors, config);
      const hash = hashConfig(config, `${style}-background-${i}-${prompt}`);
      const cachedPath = getCachedPath(hash, config);

      if (cachedPath) {
        styleBackgrounds.push(cachedPath);
        manifest.prompts.backgrounds[`${style}-${i}`] = prompt;
        continue;
      }

      if (config.dryRun) {
        console.log(`  [DRY-RUN] Would generate: ${style}-${i}`);
        console.log(`    Prompt: ${prompt}`);
        const dryRunPath = join(outputDir, 'variants', style, `${i}`, 'background-dry-run.png');
        styleBackgrounds.push(dryRunPath);
        manifest.prompts.backgrounds[`${style}-${i}`] = prompt;
        continue;
      }

      const outputPath = join(outputDir, 'variants', style, `${i}`, 'background.png');

      const task = limit(async () => {
        const result = await generateBackground(prompt, outputPath, config);
        setCachedPath(hash, result.path, config);
        styleBackgrounds.push(result.path);
        manifest.prompts.backgrounds[`${style}-${i}`] = prompt;
        manifest.generated.backgrounds.push(result.path);
        // Report cost
        if (onCost) {
          onCost(result.cost.cost, 'backgrounds');
        }
        return result.path;
      });

      tasks.push(task);
    }

    backgrounds.set(style, styleBackgrounds);
  }

  if (!config.dryRun) {
    await Promise.all(tasks);
  }

  return backgrounds;
}
