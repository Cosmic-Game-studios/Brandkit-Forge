import type { BrandConfig, BrandkitManifest, CostInfo } from '../types.js';
import { buildBackgroundPrompt, buildEditPrompt } from '../lib/prompts.js';

export type DemoProgressCallback = (message: string) => void;
export type DemoCostCallback = (cost: CostInfo) => void;

export interface DemoPrompt {
  type: 'background' | 'hero';
  style: string;
  variant: number;
  prompt: string;
}

export interface DemoResult {
  manifest: BrandkitManifest;
  files: string[];
  prompts: DemoPrompt[];
}

export async function generateDemoKit(
  config: BrandConfig,
  outputDir: string,
  onProgress?: DemoProgressCallback,
  onCost?: DemoCostCallback
): Promise<DemoResult> {
  const progress = onProgress || (() => {});

  const costInfo: CostInfo = {
    totalCost: 0,
    apiCalls: 0,
    breakdown: { backgrounds: 0, heroes: 0 },
  };

  progress('Demo Mode: Generating prompts for manual use...');
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

  const generatedPrompts: DemoPrompt[] = [];

  progress('\n--- BACKGROUND PROMPTS ---');
  progress('Copy these into ChatGPT/DALL-E to generate backgrounds:\n');

  for (const style of config.styles) {
    for (let i = 0; i < config.n; i++) {
      const prompt = buildBackgroundPrompt(style, config.colors, config);
      manifest.prompts.backgrounds[`${style}-${i}`] = prompt;

      generatedPrompts.push({
        type: 'background',
        style,
        variant: i,
        prompt,
      });

      progress(`[PROMPT:BACKGROUND:${style}:${i}]`);
      progress(prompt);
      progress('---');
    }
  }

  progress('\n--- HERO EDIT PROMPT ---');
  progress('After generating a background, use this prompt to add your logo:\n');

  const editPrompt = buildEditPrompt(config);
  manifest.prompts.edits['hero'] = editPrompt;

  generatedPrompts.push({
    type: 'hero',
    style: 'all',
    variant: 0,
    prompt: editPrompt,
  });

  progress(`[PROMPT:HERO:edit:0]`);
  progress(editPrompt);
  progress('---');

  progress('\nDemo complete! Copy the prompts above to use in ChatGPT.');
  progress('Tip: Use "Generate image" in ChatGPT with these prompts.');

  if (onCost) {
    onCost(costInfo);
  }

  return { manifest, files: [], prompts: generatedPrompts };
}
