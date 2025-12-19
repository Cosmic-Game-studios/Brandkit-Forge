#!/usr/bin/env node
import { Command } from 'commander';
import { join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';
import type { BrandConfig } from './types.js';
import { forgeBrandKit } from './core/forge.js';
import { getDefaultPresetId, getPromptPresetIds } from './lib/promptLibrary.js';

dotenv.config();

const ConfigSchema = z.object({
  logo: z.string().min(1, 'Logo path is required'),
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().optional(),
  colors: z.string().optional(),
  styles: z.string().optional(),
  preset: z.string().optional(),
  n: z.string().optional(),
  out: z.string().optional(),
  format: z.enum(['png', 'webp', 'jpeg']).optional(),
  quality: z.enum(['low', 'medium', 'high', 'auto']).optional(),
  'dry-run': z.boolean().optional(),
  cache: z.boolean().optional(),
});

function parseColors(colorsStr?: string): string[] {
  if (!colorsStr) return [];
  return colorsStr.split(',').map((c) => c.trim()).filter(Boolean);
}

function parseStyles(stylesStr?: string): string[] {
  if (!stylesStr) return ['minimal', 'neon', 'clay', 'blueprint'];
  return stylesStr.split(',').map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const defaultPreset = getDefaultPresetId();
  const presetList = getPromptPresetIds().join('|');
  const program = new Command();

  program
    .name('brandkit-forge')
    .description('One logo in -> complete launch asset pack out')
    .version('1.0.0')
    .requiredOption('--logo <path>', 'Path to logo (png/webp/jpg)')
    .requiredOption('--name <name>', 'Brand name')
    .option('--tagline <text>', 'Tagline (optional)')
    .option('--colors <colors>', 'Comma-separated colors (#RRGGBB)')
    .option(
      '--styles <styles>',
      'Comma-separated styles (default: minimal,neon,clay,blueprint)'
    )
    .option(
      '--preset <preset>',
      `Prompt preset: ${presetList} (default: ${defaultPreset})`,
      defaultPreset
    )
    .option('-n <number>', 'Variants per style (default: 2)', '2')
    .option('--out <dir>', 'Output directory (default: ./out)', './out')
    .option('--format <format>', 'Output format: png|webp|jpeg (default: png)', 'png')
    .option(
      '--quality <quality>',
      'Quality: low|medium|high|auto (default: high)',
      'high'
    )
    .option('--dry-run', 'Show prompts and plan without API calls', false)
    .option('--no-cache', 'Disable caching', false)
    .parse(process.argv);

  const options = program.opts();

  try {
    const validated = ConfigSchema.parse({
      logo: options.logo,
      name: options.name,
      tagline: options.tagline,
      colors: options.colors,
      styles: options.styles,
      preset: options.preset,
      n: options.n,
      out: options.out,
      format: options.format,
      quality: options.quality,
      'dry-run': options.dryRun || false,
      cache: options.cache !== false,
    });

    const config: BrandConfig = {
      logoPath: validated.logo,
      name: validated.name,
      tagline: validated.tagline,
      colors: parseColors(validated.colors),
      styles: parseStyles(validated.styles),
      preset: validated.preset || defaultPreset,
      n: parseInt(validated.n || '2', 10),
      outputDir: validated.out || './out',
      format: validated.format || 'png',
      quality: validated.quality || 'high',
      dryRun: validated['dry-run'] || false,
      cache: validated.cache !== false,
    };

    if (!existsSync(config.logoPath)) {
      console.error(`Error: logo file not found: ${config.logoPath}`);
      process.exit(1);
    }

    console.log('\nBrandkit Forge');
    console.log('==================\n');

    const result = await forgeBrandKit(config, {
      onProgress: (msg) => console.log(msg),
    });

    console.log(`\nOutput directory: ${result.outDir}`);
    console.log(`Gallery: ${join(result.outDir, 'gallery', 'index.html')}`);
    console.log(`Manifest: ${result.manifestPath}\n`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error('\nTip: Create a .env file with: OPENAI_API_KEY=your_key');
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
