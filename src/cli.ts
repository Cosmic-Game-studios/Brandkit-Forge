#!/usr/bin/env node
import { Command } from 'commander';
import { join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';
import type { BrandConfig } from './types.js';
import { forgeBrandKit } from './core/forge.js';
import { getDefaultPresetId, getPromptPresetIds } from './lib/promptLibrary.js';
import { getDefaultStyles, getAllBuiltInStyles } from './lib/styles.js';
import { normalizeConfig } from './lib/config.js';
import { getTemplates, getTemplate } from './lib/templates.js';
import { extractColors, suggestPreset, suggestStyles } from './lib/colorExtractor.js';

dotenv.config();

// ANSI color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  teal: '\x1b[36m',
  orange: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
};

function banner() {
  console.log(`
${c.teal}${c.bold}  ____                      _ _    _ _     _____                    ${c.reset}
${c.teal}${c.bold} | __ ) _ __ __ _ _ __   __| | | _(_) |_  |  ___|__  _ __ __ _  ___ ${c.reset}
${c.teal}${c.bold} |  _ \\| '__/ _\` | '_ \\ / _\` | |/ / | __| | |_ / _ \\| '__/ _\` |/ _ \\${c.reset}
${c.orange}${c.bold} | |_) | | | (_| | | | | (_| |   <| | |_  |  _| (_) | | | (_| |  __/${c.reset}
${c.orange}${c.bold} |____/|_|  \\__,_|_| |_|\\__,_|_|\\_\\_|\\__| |_|  \\___/|_|  \\__, |\\___| ${c.reset}
${c.orange}${c.bold}                                                          |___/      ${c.reset}
${c.dim}  v2.0 — AI-powered brand asset generation${c.reset}
`);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem.toFixed(0)}s`;
}

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
  template: z.string().optional(),
  'analyze-colors': z.boolean().optional(),
});

async function main() {
  const defaultPreset = getDefaultPresetId();
  const presetList = getPromptPresetIds().join('|');
  const defaultStylesLabel = getDefaultStyles().join(',');
  const allStyles = getAllBuiltInStyles().join(',');
  const program = new Command();

  program
    .name('brandkit-forge')
    .description('One logo in -> complete launch asset pack out')
    .version('2.0.0')
    .requiredOption('--logo <path>', 'Path to logo (png/webp/jpg)')
    .requiredOption('--name <name>', 'Brand name')
    .option('--tagline <text>', 'Tagline (optional)')
    .option('--colors <colors>', 'Comma-separated colors (#RRGGBB)')
    .option(
      '--styles <styles>',
      `Comma-separated styles (default: ${defaultStylesLabel})\n  Available: ${allStyles}`
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
    .option('--template <id>', 'Use an industry template (run --list-templates to see)')
    .option('--list-templates', 'List available industry templates')
    .option('--analyze-colors', 'Auto-extract dominant colors from logo')
    .parse(process.argv);

  const options = program.opts();

  // Handle --list-templates
  if (options.listTemplates) {
    banner();
    console.log(`${c.bold}Available Industry Templates:${c.reset}\n`);
    const templates = getTemplates();
    for (const t of templates) {
      console.log(`  ${c.teal}${c.bold}${t.id}${c.reset} ${c.dim}(${t.industry})${c.reset}`);
      console.log(`    ${t.description}`);
      console.log(`    ${c.dim}Styles: ${t.styles.join(', ')} | Preset: ${t.preset}${c.reset}`);
      console.log();
    }
    return;
  }

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
      template: options.template,
      'analyze-colors': options.analyzeColors || false,
    });

    // Apply template if specified
    let templateStyles = validated.styles;
    let templatePreset = validated.preset || defaultPreset;
    let templateColors = validated.colors;

    if (validated.template) {
      const tmpl = getTemplate(validated.template);
      if (!tmpl) {
        console.error(`${c.red}Error: Unknown template "${validated.template}". Run --list-templates to see available options.${c.reset}`);
        process.exit(1);
      }
      console.log(`${c.teal}Using template: ${c.bold}${tmpl.name}${c.reset} ${c.dim}(${tmpl.industry})${c.reset}`);
      templateStyles = templateStyles || tmpl.styles.join(',');
      templatePreset = validated.preset || tmpl.preset;
      templateColors = templateColors || tmpl.suggestedColors.join(',');
    }

    // Auto-extract colors if requested
    if (validated['analyze-colors'] && existsSync(validated.logo)) {
      console.log(`\n${c.blue}Analyzing logo colors...${c.reset}`);
      const palette = await extractColors(validated.logo);
      console.log(`  Dominant: ${c.bold}${palette.dominant.hex}${c.reset}`);
      console.log(`  Palette: ${palette.colors.map(cc => `${cc.hex} (${cc.percentage}%)`).join(', ')}`);
      console.log(`  ${c.dim}Dark: ${palette.isDark} | Vibrant: ${palette.isVibrant}${c.reset}`);

      if (!templateColors) {
        templateColors = palette.colors.slice(0, 3).map(cc => cc.hex).join(',');
        console.log(`  ${c.green}Auto-applied colors: ${templateColors}${c.reset}`);
      }

      if (!validated.template && validated.preset === defaultPreset) {
        const suggested = suggestPreset(palette);
        templatePreset = suggested;
        console.log(`  ${c.green}Suggested preset: ${suggested}${c.reset}`);
      }

      if (!validated.template && !validated.styles) {
        const suggested = suggestStyles(palette);
        templateStyles = suggested.join(',');
        console.log(`  ${c.green}Suggested styles: ${suggested.join(', ')}${c.reset}`);
      }
    }

    const normalized = normalizeConfig({
      name: validated.name,
      tagline: validated.tagline,
      colors: templateColors,
      styles: templateStyles,
      preset: templatePreset,
      n: validated.n,
      format: validated.format,
      quality: validated.quality,
      dryRun: validated['dry-run'] || false,
      cache: validated.cache !== false,
    });

    const config: BrandConfig = {
      ...normalized,
      logoPath: validated.logo,
      outputDir: validated.out || './out',
    };

    if (!existsSync(config.logoPath)) {
      console.error(`${c.red}Error: logo file not found: ${config.logoPath}${c.reset}`);
      process.exit(1);
    }

    banner();

    const result = await forgeBrandKit(config, {
      onProgress: (msg) => {
        if (msg.startsWith('\nStep')) {
          console.log(`\n${c.teal}${c.bold}${msg.trim()}${c.reset}`);
        } else if (msg.startsWith('  Completed')) {
          console.log(`${c.green}${msg}${c.reset}`);
        } else if (msg.startsWith('\nDone')) {
          console.log(`\n${c.green}${c.bold}${msg.trim()}${c.reset}`);
        } else if (msg.includes('cost:')) {
          console.log(`${c.orange}${msg}${c.reset}`);
        } else {
          console.log(`${c.dim}${msg}${c.reset}`);
        }
      },
    });

    console.log(`\n${c.bold}${c.white}=== Results ===${c.reset}`);
    console.log(`  ${c.dim}Output:${c.reset}   ${result.outDir}`);
    console.log(`  ${c.dim}Gallery:${c.reset}  ${join(result.outDir, 'gallery', 'index.html')}`);
    console.log(`  ${c.dim}Manifest:${c.reset} ${result.manifestPath}`);
    console.log(`  ${c.dim}Files:${c.reset}    ${result.files.length} generated`);
    console.log(`  ${c.dim}Cost:${c.reset}     ${c.orange}$${result.cost.totalCost.toFixed(4)}${c.reset}`);
    console.log(`  ${c.dim}Time:${c.reset}     ${formatDuration(result.performance.totalDurationMs)}`);

    if (result.performance.steps.length > 0) {
      console.log(`\n${c.bold}Performance Breakdown:${c.reset}`);
      for (const step of result.performance.steps) {
        const pct = Math.round((step.durationMs / result.performance.totalDurationMs) * 100);
        const bar = '\u2588'.repeat(Math.max(1, Math.round(pct / 5)));
        console.log(`  ${c.dim}${step.name.padEnd(14)}${c.reset} ${c.teal}${bar}${c.reset} ${formatDuration(step.durationMs)} ${c.dim}(${pct}%)${c.reset}`);
      }
    }

    console.log();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`${c.red}${c.bold}Validation error:${c.reset}`);
      error.errors.forEach((err) => {
        console.error(`  ${c.red}- ${err.path.join('.')}: ${err.message}${c.reset}`);
      });
    } else if (error instanceof Error) {
      console.error(`${c.red}Error: ${error.message}${c.reset}`);
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error(`\n${c.dim}Tip: Create a .env file with: OPENAI_API_KEY=your_key${c.reset}`);
      }
    } else {
      console.error(`${c.red}Unknown error:${c.reset}`, error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
